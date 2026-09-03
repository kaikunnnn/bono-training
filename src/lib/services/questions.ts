"use server";

import { createClient, getCachedUser } from "@/lib/supabase/server";
// 掲示板は投稿直後の即時反映が必要なため live クライアント（useCdn:false）を使う。
// 他のコンテンツは既定の CDN クライアント（issue #163）。
import { liveClient as getClient } from "@/lib/sanity";
import { revalidatePath } from "next/cache";
import type { Question, QuestionCategory } from "@/types/sanity";
import { adjustBoardUserStats } from "@/lib/questions/board-user-stats";
import { createNotification } from "@/lib/services/notifications-create";

// ============================================
// 型定義
// ============================================

export type ReactionKey = "cheer" | "thanks" | "insight";
export type ReactionTarget = "question" | "comment";

export interface QuestionComment {
  id: string;
  questionId: string;
  userId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  /** 添付画像の公開URL（question-attachments バケット、1コメント1枚）。未添付は undefined */
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReactionCount {
  targetType: ReactionTarget;
  targetId: string;
  reaction: ReactionKey;
  count: number;
}

export interface QuestionListItem {
  question: Question;
  commentCount: number;
  reactionCounts: Record<ReactionKey, number>;
  /** publishedAt と最新コメント時刻の遅い方（新着コメントでの浮上ソートに使う） */
  lastActivityAt: string;
  /**
   * 直近コメント者（重複除去済み・最新順・最大3人）。カードのアバタースタック表示用。
   * 非メンバー（未ログイン）は RLS で View が 0 行を返すため空配列になる。コメント0件でも空配列。
   */
  recentCommenters: Array<{
    userId: string;
    name: string;
    avatarUrl: string | null;
  }>;
}

// ============================================
// Sanity 読み取り
// ============================================

/**
 * 質問一覧 + コメント数 + スタンプ集計を取得。
 *
 * ※ コメント数とスタンプは Supabase の View から IN クエリで取得（N+1回避）
 * ※ 並び順は「新着コメントでの浮上」を実現するため
 *   last_activity = max(publishedAt, そのスレッドの最新コメント created_at) の降順。
 *   Sanity から候補を多め（最大 CANDIDATE_POOL 件）に取得 → コメント最新時刻を IN クエリで集計 →
 *   last_activity でソート → 上位 limit 件を返す。専用ビューは作らない（migration 不要）。
 *
 * @param params.limit 最終的に返す件数（デフォルト 20）。互換のため意味は「返す件数」。
 */
// 表示は最新6件。候補プールはSanity取得＋Supabase集計の転送量に直結するため 20 に抑える（#153）。
// トレードオフ: last_activity（新着コメント）で浮上させる仕様上、
// 「publishedAt が候補21件目以降の古いスレッドに新規コメントが付いた」場合、
// そのスレッドが本来上位に浮上すべきでも候補に入らず取りこぼす可能性がわずかに増える。
// 表示6件に対し20件の候補があれば実運用上の浮上は十分カバーできると判断（#153）。
const CANDIDATE_POOL = 20;

/** カード用の共通 projection（QuestionListItem 生成に必要なフィールドを揃える） */
// questionContent はカードでは extractPreviewText で先頭4行しか使わないため、
// 全文転送を避け先頭8ブロックのみ取得する（本文が長いスレッドほど転送量削減効果が大きい。#153）。
const QUESTION_CARD_PROJECTION = `{
    _id,
    title,
    slug,
    publishedAt,
    "questionContent": questionContent[0...8],
    figmaUrl,
    author,
    category->{_id, title, slug}
  }`;

/**
 * Sanity から取得済みの質問配列に、Supabase 側のエンゲージメント集計
 * （コメント数・スタンプ3種・最新コメント時刻）を IN クエリ1回ずつで付与して
 * QuestionListItem[] に変換する。N+1 を避けるため一覧・関連・最近で共通利用する。
 *
 * ※ 並び替えはしない。呼び出し側の要求（浮上ソート／公開日順など）に委ねる。
 */
/** question_comment_summaries View の recent_commenters jsonb 要素の生の形 */
type RecentCommenterRow = {
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
};

async function buildListItems(questions: Question[]): Promise<QuestionListItem[]> {
  if (questions.length === 0) return [];

  const ids = questions.map((q) => q._id);
  const supabase = await createClient();

  // コメント集計（数・最新時刻・直近コメント者）は新 View question_comment_summaries に統合し、
  // リアクション集計は既存 View と合わせて 2 並列で取得する（#153・転送量削減）。
  const [summaryResult, reactionCountsResult] = await Promise.all([
    supabase
      .from("question_comment_summaries")
      .select("question_id, comment_count, latest_commented_at, recent_commenters")
      .in("question_id", ids),
    supabase
      .from("question_reaction_counts")
      .select("target_type, target_id, reaction, count")
      .eq("target_type", "question")
      .in("target_id", ids),
  ]);

  // 失敗時は空にフォールバックしページはクラッシュさせない。ただし黙殺せず console.error に残す（#153）。
  if (summaryResult.error) {
    console.error("[buildListItems] question_comment_summaries", summaryResult.error);
  }
  if (reactionCountsResult.error) {
    console.error("[buildListItems] question_reaction_counts", reactionCountsResult.error);
  }

  // 質問ID → 集計（コメント数 / 最新コメント時刻 / 直近コメント者）
  const summaryMap = new Map<
    string,
    {
      commentCount: number;
      latestCommentedAt: string | null;
      recentCommenters: QuestionListItem["recentCommenters"];
    }
  >();
  (summaryResult.data ?? []).forEach((r) => {
    const rawCommenters = (r.recent_commenters ?? []) as RecentCommenterRow[];
    summaryMap.set(r.question_id as string, {
      commentCount: (r.comment_count as number) ?? 0,
      latestCommentedAt: (r.latest_commented_at as string | null) ?? null,
      recentCommenters: rawCommenters.map((c) => ({
        userId: c.user_id,
        name: c.author_name,
        avatarUrl: c.author_avatar_url ?? null,
      })),
    });
  });

  const reactionMap = new Map<string, Record<ReactionKey, number>>();
  (reactionCountsResult.data ?? []).forEach((r) => {
    const key = r.target_id as string;
    const existing = reactionMap.get(key) ?? { cheer: 0, thanks: 0, insight: 0 };
    existing[r.reaction as ReactionKey] = r.count as number;
    reactionMap.set(key, existing);
  });

  return questions.map((q) => {
    const publishedAt = q.publishedAt ?? "";
    const summary = summaryMap.get(q._id);
    const latestComment = summary?.latestCommentedAt;
    const lastActivityAt =
      latestComment && latestComment > publishedAt ? latestComment : publishedAt;
    return {
      question: q,
      commentCount: summary?.commentCount ?? 0,
      reactionCounts: reactionMap.get(q._id) ?? {
        cheer: 0,
        thanks: 0,
        insight: 0,
      },
      lastActivityAt,
      recentCommenters: summary?.recentCommenters ?? [],
    };
  });
}

export async function getQuestionList(params?: {
  categorySlug?: string;
  limit?: number;
}): Promise<QuestionListItem[]> {
  const limit = Math.min(Math.max(params?.limit ?? 20, 1), 100);
  const categoryFilter = params?.categorySlug
    ? `&& category->slug.current == $categorySlug`
    : "";

  // 浮上ソートのため候補を多めに取得してから JS 側で並べ替える
  const sanityQuery = `*[_type == "question" ${categoryFilter}] | order(publishedAt desc)[0...${CANDIDATE_POOL}]${QUESTION_CARD_PROJECTION}`;

  const questions = await getClient().fetch<Question[]>(
    sanityQuery,
    params?.categorySlug ? { categorySlug: params.categorySlug } : {},
    { next: { revalidate: 60, tags: ["questions"] } },
  );

  const items = await buildListItems(questions);

  // last_activity 降順（ISO 文字列は辞書順 = 時系列順）。同着は publishedAt 降順で安定化。
  items.sort((a, b) => {
    if (a.lastActivityAt !== b.lastActivityAt) {
      return a.lastActivityAt < b.lastActivityAt ? 1 : -1;
    }
    return (a.question.publishedAt ?? "") < (b.question.publishedAt ?? "") ? 1 : -1;
  });

  return items.slice(0, limit);
}

/**
 * 詳細ページ「関連するスレッド」用：同じカテゴリの他スレッドを公開日の新しい順で取得。
 * excludeIds（現在表示中のスレッド等）は除外する。カード表示に必要な集計付き。
 */
export async function getRelatedQuestions(params: {
  categorySlug: string;
  excludeIds?: string[];
  limit?: number;
}): Promise<QuestionListItem[]> {
  const limit = Math.min(Math.max(params.limit ?? 2, 1), 20);
  const excludeIds = params.excludeIds ?? [];

  // limit は上でクランプ済みの安全な整数。GROQ の range は変数を取らないため文字列に埋め込む
  const query = `*[_type == "question"
    && category->slug.current == $categorySlug
    && !(_id in $excludeIds)
  ] | order(publishedAt desc)[0...${limit}]${QUESTION_CARD_PROJECTION}`;

  const questions = await getClient().fetch<Question[]>(
    query,
    { categorySlug: params.categorySlug, excludeIds },
    { next: { revalidate: 60, tags: ["questions"] } },
  );

  return buildListItems(questions);
}

/**
 * 詳細ページ「最近のスレッド」用：公開日の新しい順で取得。
 * excludeIds（現在表示中のスレッド＋関連セクションに出したもの）は除外する。
 */
export async function getRecentQuestions(params?: {
  excludeIds?: string[];
  limit?: number;
}): Promise<QuestionListItem[]> {
  const limit = Math.min(Math.max(params?.limit ?? 2, 1), 20);
  const excludeIds = params?.excludeIds ?? [];

  // limit は上でクランプ済みの安全な整数。GROQ の range は変数を取らないため文字列に埋め込む
  const query = `*[_type == "question"
    && !(_id in $excludeIds)
  ] | order(publishedAt desc)[0...${limit}]${QUESTION_CARD_PROJECTION}`;

  const questions = await getClient().fetch<Question[]>(
    query,
    { excludeIds },
    { next: { revalidate: 60, tags: ["questions"] } },
  );

  return buildListItems(questions);
}

export async function getQuestionBySlug(slug: string): Promise<Question | null> {
  const query = `*[_type == "question" && slug.current == $slug][0]{
    _id, title, slug, publishedAt, questionContent, figmaUrl, referenceUrls, attachedImage, author,
    category->{_id, title, slug}
  }`;
  return getClient().fetch<Question | null>(query, { slug }, {
    next: { revalidate: 60, tags: ["questions", `question:${slug}`] },
  });
}

export async function getQuestionCategories(): Promise<QuestionCategory[]> {
  const query = `*[_type == "questionCategory"] | order(order asc){_id, title, slug}`;
  return getClient().fetch<QuestionCategory[]>(query, {}, {
    next: { revalidate: 300, tags: ["questionCategories"] },
  });
}

// ============================================
// Supabase: コメント
// ============================================

const COMMENT_COLUMNS =
  "id, question_id, user_id, author_name, author_avatar_url, content, image_url, created_at, updated_at";

type CommentRow = {
  id: string;
  question_id: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

function rowToComment(r: CommentRow): QuestionComment {
  return {
    id: r.id,
    questionId: r.question_id,
    userId: r.user_id,
    authorName: r.author_name,
    authorAvatarUrl: r.author_avatar_url ?? undefined,
    content: r.content,
    imageUrl: r.image_url ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getCommentsByQuestion(questionId: string): Promise<QuestionComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_comments")
    .select(COMMENT_COLUMNS)
    .eq("question_id", questionId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getCommentsByQuestion]", error);
    return [];
  }
  return (data as CommentRow[] ?? []).map(rowToComment);
}

const COMMENT_MAX_LENGTH = 5000;

/** クライアントの maxLength を迂回した直接呼び出しにも耐えるサーバー側検証 */
function validateCommentContent(
  raw: string,
): { ok: true; content: string } | { ok: false; error: string } {
  const content = raw.trim();
  if (!content) return { ok: false, error: "コメントを入力してください" };
  if (content.length > COMMENT_MAX_LENGTH) {
    return {
      ok: false,
      error: `コメントは${COMMENT_MAX_LENGTH}文字以内で入力してください`,
    };
  }
  return { ok: true, content };
}

// 添付画像 URL の許可バケット（question/new/actions.ts の ATTACHMENT_BUCKET と一致）
const ATTACHMENT_BUCKET = "question-attachments";

/**
 * クライアントから来る画像URLが、自分がアップロードした question-attachments の
 * 公開URL（`{SUPABASE_URL}/storage/v1/object/public/question-attachments/{uid}/...`）で
 * あることを検証する。他人のファイルURL・外部URLの注入を防ぐ。
 */
function isOwnAttachmentUrl(value: string, userId: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/${ATTACHMENT_BUCKET}/${userId}/`;
  return value.startsWith(expectedPrefix);
}

// 本文プレビュー用に前後空白を除去して指定長でtruncate（末尾に … を付与）
function truncateForPreview(text: string, maxLength = 300): string {
  const normalized = text.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}

// コメント投稿のSlack通知（api/questions/submit の質問投稿通知と同じ webhook を使用）
async function sendCommentSlackNotification(data: {
  questionSlug: string;
  questionTitle: string | null;
  authorName: string;
  content: string;
  imageUrl?: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design";
  const questionPageUrl = `${siteUrl}/questions/${data.questionSlug}`;

  // 質問投稿側（api/questions/submit/route.ts の imageBlocks）と同形式の image ブロック
  const imageBlocks = data.imageUrl
    ? [
        {
          type: "image",
          image_url: data.imageUrl,
          alt_text: "添付画像",
        },
      ]
    : [];

  const message = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "💬 新しいコメントがありました", emoji: true },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*スレッド:*\n${data.questionTitle || "(タイトル不明)"}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*コメント者:*\n${data.authorName}`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*コメント内容:*\n${truncateForPreview(data.content)}`,
        },
      },
      ...imageBlocks,
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "💬 詳細ページを開く", emoji: true },
            url: questionPageUrl,
            style: "primary",
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Failed to send comment Slack notification:", error);
  }
}

/**
 * 質問へのコメント投稿を、その質問の投稿主へサイト内通知する（#160 S1・ベストエフォート）。
 *
 * 宛先（投稿主 userId）は質問本体（Sanity）にしか無いため、ここで軽く GROQ を投げて解決する。
 * author.userId が欠けている質問は通知を skip + console.error のみ（クラッシュ・投稿失敗にしない）。
 * createNotification 側で自己通知抑止・未読重複抑止を行う。
 */
async function notifyQuestionAuthorOfComment(input: {
  questionId: string;
  questionSlug: string;
  commentId: string;
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  content: string;
}) {
  try {
    const question = await getClient().fetch<{
      author?: { userId?: string };
      title?: string;
    } | null>(
      `*[_type == "question" && _id == $id][0]{ title, author }`,
      { id: input.questionId },
    );

    const recipientId = question?.author?.userId;
    if (!recipientId) {
      // 過去/インポート質問で author.userId が欠けているケース。通知は諦め、投稿処理は続行。
      console.error(
        "[notifyQuestionAuthorOfComment] missing author.userId for question",
        input.questionId,
      );
      return;
    }

    await createNotification({
      recipientId,
      actorId: input.actorId,
      actorName: input.actorName,
      actorAvatarUrl: input.actorAvatarUrl,
      type: "question_comment",
      // entity をコメント単位にする（案A: 1コメント＝1通知）。これで重複抑止が
      // 「同一コメントの重複作成のみ抑止／別コメントは別通知」として自然に効く。
      entityType: "comment",
      entityId: input.commentId,
      // アンカー付きで該当コメント位置へ遷移させる（QuestionCommentsSection がスクロール）
      linkUrl: `/questions/${input.questionSlug}#comment-${input.commentId}`,
      payload: {
        questionTitle: question?.title ?? null,
        preview: truncateForPreview(input.content, 140),
      },
    });
  } catch (error) {
    console.error("[notifyQuestionAuthorOfComment] threw:", error);
  }
}

/**
 * コメントが付いたスレッドの「過去にコメントした人（＝参加者）」全員へ通知する（#160）。
 *
 * スレ主（質問の投稿者）は notifyQuestionAuthorOfComment が担当。ここは投稿者本人を
 * 除いた参加者へ「新しいコメントが付いた」ことを知らせる。
 * type は既存の question_comment を再利用（スレ主通知と同一コメント entity のため、
 * スレ主が過去に自分でもコメントしていても createNotification の未読重複抑止で1件に収まる）。
 * createNotification 側で 自己通知抑止 / オプトアウト / 未読重複抑止 を行うため、
 * ここでは重複を含む候補をそのまま渡してよい（actor だけはクエリで除外しておく）。
 * 失敗してもコメント投稿は成功させる（ベストエフォート）。
 */
async function notifyThreadParticipantsOfComment(input: {
  questionId: string;
  questionSlug: string;
  questionTitle: string | null;
  commentId: string;
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  content: string;
}) {
  try {
    const supabase = await createClient();
    // このスレッドに過去コメントした人（投稿者本人は除外）。掲示板のコメントは
    // メンバーが全件読める RLS のため user 権限で取得できる。
    const { data, error } = await supabase
      .from("question_comments")
      .select("user_id")
      .eq("question_id", input.questionId)
      .neq("user_id", input.actorId);
    if (error) {
      console.error("[notifyThreadParticipantsOfComment] select failed:", error);
      return;
    }
    const recipientIds = [
      ...new Set((data ?? []).map((r) => r.user_id as string)),
    ];
    await Promise.all(
      recipientIds.map((recipientId) =>
        createNotification({
          recipientId,
          actorId: input.actorId,
          actorName: input.actorName,
          actorAvatarUrl: input.actorAvatarUrl,
          type: "question_comment",
          entityType: "comment",
          entityId: input.commentId,
          linkUrl: `/questions/${input.questionSlug}#comment-${input.commentId}`,
          payload: {
            questionTitle: input.questionTitle,
            preview: truncateForPreview(input.content, 140),
          },
        }),
      ),
    );
  } catch (error) {
    console.error("[notifyThreadParticipantsOfComment] threw:", error);
  }
}

export async function addComment(input: {
  questionId: string;
  questionSlug: string;
  content: string;
  imageUrl?: string;
}): Promise<{ ok: true; comment: QuestionComment } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const validated = validateCommentContent(input.content);
  if (!validated.ok) return validated;

  // 画像URLはクライアントから来る文字列。自分がアップロードした
  // question-attachments の公開URLであることを検証する（外部URL・他人ファイル注入の防止）。
  if (input.imageUrl && !isOwnAttachmentUrl(input.imageUrl, user.id)) {
    return { ok: false, error: "画像の添付に失敗しました" };
  }

  // 投稿者プロフィールを auth から snapshot して denormalize
  const authorName =
    (user.user_metadata?.display_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "メンバー";
  const authorAvatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

  const { data, error } = await supabase
    .from("question_comments")
    .insert({
      question_id: input.questionId,
      user_id: user.id,
      author_name: authorName,
      author_avatar_url: authorAvatarUrl,
      content: validated.content,
      image_url: input.imageUrl ?? null,
    })
    .select(COMMENT_COLUMNS)
    .single();

  if (error || !data) {
    // DBトリガーのレート制限（migrations/20260709_add_comment_rate_limit.sql と対）
    if (error?.message?.includes("comment_rate_limit_exceeded")) {
      return {
        ok: false,
        error: "短時間に投稿しすぎです。少し時間をおいてからもう一度お試しください",
      };
    }
    console.error("[addComment]", error);
    return { ok: false, error: "コメントの投稿に失敗しました" };
  }

  // コメント数カウントを加算（#149・ベストエフォート）
  await adjustBoardUserStats(user.id, { commentDelta: 1 });

  // スレッド名（Slack通知に付与。どのスレッドへのコメントか分かるように）。
  // 取得失敗しても通知は送る（ベストエフォート・タイトル無しで送信）。
  let questionTitle: string | null = null;
  try {
    questionTitle = await getClient().fetch<string | null>(
      `*[_type == "question" && _id == $id][0].title`,
      { id: input.questionId },
      { next: { tags: ["questions"], revalidate: 300 } },
    );
  } catch (e) {
    console.error("[addComment] スレッド名の取得に失敗（Slackはタイトル無しで送信）:", e);
  }

  await sendCommentSlackNotification({
    questionSlug: input.questionSlug,
    questionTitle,
    authorName,
    content: validated.content,
    imageUrl: input.imageUrl,
  });

  // 質問の投稿主へサイト内通知（#160・ベストエフォート。失敗してもコメント投稿は成功させる）
  await notifyQuestionAuthorOfComment({
    questionId: input.questionId,
    questionSlug: input.questionSlug,
    commentId: (data as CommentRow).id,
    actorId: user.id,
    actorName: authorName,
    actorAvatarUrl: authorAvatarUrl,
    content: validated.content,
  });

  // スレッドに過去コメントした参加者へも通知（#160・ベストエフォート）。
  // 自分がスレ主でないスレッドでも、参加中のスレッドに新規コメントが付いたら気づける。
  await notifyThreadParticipantsOfComment({
    questionId: input.questionId,
    questionSlug: input.questionSlug,
    questionTitle,
    commentId: (data as CommentRow).id,
    actorId: user.id,
    actorName: authorName,
    actorAvatarUrl: authorAvatarUrl,
    content: validated.content,
  });

  revalidatePath(`/questions/${input.questionSlug}`);
  return { ok: true, comment: rowToComment(data as CommentRow) };
}

export async function updateComment(input: {
  commentId: string;
  questionSlug: string;
  content: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const validated = validateCommentContent(input.content);
  if (!validated.ok) return validated;

  // RLS だけに頼ると 0 行更新でも成功に見えるため、所有者条件 + 更新行の確認を行う
  const { data, error } = await supabase
    .from("question_comments")
    .update({ content: validated.content })
    .eq("id", input.commentId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[updateComment]", error);
    return { ok: false, error: "コメントの更新に失敗しました" };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "コメントが見つからないか、編集する権限がありません" };
  }

  revalidatePath(`/questions/${input.questionSlug}`);
  return { ok: true };
}

export async function deleteComment(input: {
  commentId: string;
  questionSlug: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  // 注意: PostgREST は UPDATE 時に内部で RETURNING を使うため、論理削除後の行が
  // SELECT ポリシーで不可視だと 42501 で失敗する。本人が自分の削除済みコメントを
  // SELECT できるようポリシー側で許可している（20260713_fix_comment_soft_delete_rls.sql）。
  const { data, error } = await supabase
    .from("question_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", input.commentId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    // PostgrestError は enumerable でないプロパティを持つため文字列化して出す
    console.error(
      "[deleteComment]",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { ok: false, error: "コメントの削除に失敗しました" };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "コメントが見つからないか、削除する権限がありません" };
  }

  // コメント数カウントを減算（#149・ベストエフォート。0未満にはしない）
  await adjustBoardUserStats(user.id, { commentDelta: -1 });

  revalidatePath(`/questions/${input.questionSlug}`);
  return { ok: true };
}

// ============================================
// Supabase: スタンプ
// ============================================

/**
 * リアクション（スタンプ）新規追加を、その対象の作者へサイト内通知する（#160 S3・ベストエフォート）。
 *
 * notifyQuestionAuthorOfComment と対称の構造。INSERT 成功時（新規リアクション）のみ呼ぶこと。
 * 取り消し（delete）や 23505（既に押下済み）では呼ばない。
 * 宛先が欠けているケース（author.userId 未設定・コメント行が取れない等）は skip + console.error のみ
 * （クラッシュ・リアクション失敗にしない）。createNotification 側で自己通知抑止・未読重複抑止を行う。
 */
async function notifyReactionTarget(input: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  targetType: ReactionTarget;
  targetId: string;
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
}) {
  try {
    if (input.targetType === "question") {
      // 対象は質問。宛先＝質問の投稿主。宛先 userId と slug は Sanity にしか無いため GROQ で解決。
      const question = await getClient().fetch<{
        title?: string;
        author?: { userId?: string };
        slug?: string;
      } | null>(
        `*[_type == "question" && _id == $id][0]{ title, author, "slug": slug.current }`,
        { id: input.targetId },
      );

      const recipientId = question?.author?.userId;
      if (!recipientId) {
        console.error(
          "[notifyReactionTarget] missing author.userId for question",
          input.targetId,
        );
        return;
      }
      // 参照整合: slug 解決不能なら壊れた遷移先の通知は作らず skip + ログ（コメント側と対称）。
      if (!question?.slug) {
        console.error(
          "[notifyReactionTarget] could not resolve slug for question",
          input.targetId,
        );
        return;
      }

      await createNotification({
        recipientId,
        actorId: input.actorId,
        actorName: input.actorName,
        actorAvatarUrl: input.actorAvatarUrl,
        type: "question_reaction",
        entityType: "question",
        entityId: input.targetId,
        linkUrl: `/questions/${question.slug}`,
        payload: { questionTitle: question?.title ?? null },
      });
      return;
    }

    // targetType === "comment": 対象はコメント。宛先＝コメント投稿者。
    // まずローカル Supabase の question_comments から user_id（宛先）と question_id を引く。
    const { data: comment, error } = await input.supabase
      .from("question_comments")
      .select("user_id, question_id")
      .eq("id", input.targetId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !comment) {
      console.error("[notifyReactionTarget] comment lookup failed", input.targetId, error);
      return;
    }

    const recipientId = comment.user_id as string | null;
    if (!recipientId) {
      console.error("[notifyReactionTarget] missing user_id for comment", input.targetId);
      return;
    }

    // question_id（Sanity _id）から slug と title を解決（遷移先 URL / 表示用）。
    const question = await getClient().fetch<{
      title?: string;
      slug?: string;
    } | null>(
      `*[_type == "question" && _id == $id][0]{ title, "slug": slug.current }`,
      { id: comment.question_id as string },
    );

    // 参照整合: Sanity から質問が消えている等で slug 解決不能なら、壊れた遷移先の通知は作らず skip + ログ。
    if (!question?.slug) {
      console.error(
        "[notifyReactionTarget] could not resolve question slug for comment",
        input.targetId,
        comment.question_id,
      );
      return;
    }

    await createNotification({
      recipientId,
      actorId: input.actorId,
      actorName: input.actorName,
      actorAvatarUrl: input.actorAvatarUrl,
      type: "comment_reaction",
      entityType: "comment",
      entityId: input.targetId,
      linkUrl: `/questions/${question.slug}`,
      payload: { questionTitle: question?.title ?? null },
    });
  } catch (error) {
    console.error("[notifyReactionTarget] threw:", error);
  }
}

/** トグル：押されていれば取り消し、なければ追加 */
export async function toggleReaction(input: {
  targetType: ReactionTarget;
  targetId: string;
  reaction: ReactionKey;
}): Promise<{ ok: boolean; active?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const { data: existing } = await supabase
    .from("question_reactions")
    .select("id")
    .eq("target_type", input.targetType)
    .eq("target_id", input.targetId)
    .eq("user_id", user.id)
    .eq("reaction", input.reaction)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("question_reactions").delete().eq("id", existing.id as string);
    if (error) {
      console.error("[toggleReaction:delete]", error);
      return { ok: false, error: "スタンプの取り消しに失敗しました" };
    }
    return { ok: true, active: false };
  }

  const { error } = await supabase.from("question_reactions").insert({
    target_type: input.targetType,
    target_id: input.targetId,
    user_id: user.id,
    reaction: input.reaction,
  });
  if (error) {
    // 2タブ同時押し等で check-then-insert が競合した場合（unique_violation）は
    // 「既に押されている」＝目的の状態なので成功として扱う（既に押下済みなので通知不要）
    if (error.code === "23505") return { ok: true, active: true };
    console.error("[toggleReaction:insert]", error);
    return { ok: false, error: "スタンプの送信に失敗しました" };
  }

  // 新規リアクション（INSERT 成功）時のみ、対象の作者へサイト内通知（#160 S3・ベストエフォート。
  // 失敗してもリアクション自体は成功させる）。addComment と同じ思想。
  const actorName =
    (user.user_metadata?.display_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "メンバー";
  const actorAvatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;
  await notifyReactionTarget({
    supabase,
    targetType: input.targetType,
    targetId: input.targetId,
    actorId: user.id,
    actorName,
    actorAvatarUrl,
  });

  return { ok: true, active: true };
}

/** 自分が押している reaction の一覧（一覧表示でハイライトに使う） */
export async function getMyReactions(input: {
  targetType: ReactionTarget;
  targetIds: string[];
}): Promise<Array<{ targetId: string; reaction: ReactionKey }>> {
  if (input.targetIds.length === 0) return [];
  const supabase = await createClient();
  // auth.getUser() はリクエストスコープでキャッシュ済み（質問用・コメント用の
  // getMyReactions 2回や getSubscriptionStatus 等との認証往復の重複を排除）
  const user = await getCachedUser();
  if (!user) return [];

  const { data } = await supabase
    .from("question_reactions")
    .select("target_id, reaction")
    .eq("target_type", input.targetType)
    .eq("user_id", user.id)
    .in("target_id", input.targetIds);

  return (data ?? []).map((r) => ({
    targetId: r.target_id as string,
    reaction: r.reaction as ReactionKey,
  }));
}

/** リアクション集計を target_id ごとの Record にまとめる（IN クエリ1回） */
export async function getReactionCountsMap(input: {
  targetType: ReactionTarget;
  targetIds: string[];
}): Promise<Record<string, Record<ReactionKey, number>>> {
  if (input.targetIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_reaction_counts")
    .select("target_id, reaction, count")
    .eq("target_type", input.targetType)
    .in("target_id", input.targetIds);

  const map: Record<string, Record<ReactionKey, number>> = {};
  (data ?? []).forEach((r) => {
    const id = r.target_id as string;
    if (!map[id]) map[id] = { cheer: 0, thanks: 0, insight: 0 };
    map[id][r.reaction as ReactionKey] = r.count as number;
  });
  return map;
}

