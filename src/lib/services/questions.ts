"use server";

import { createClient } from "@/lib/supabase/server";
import { client as getClient } from "@/lib/sanity";
import { revalidatePath } from "next/cache";
import type { Question, QuestionCategory } from "@/types/sanity";

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
}

// ============================================
// Sanity 読み取り
// ============================================

/**
 * 質問一覧 + コメント数 + スタンプ集計を 1往復で取得
 * ※ コメント数とスタンプは Supabase の View から IN クエリで取得（N+1回避）
 */
export async function getQuestionList(params?: {
  categorySlug?: string;
  limit?: number;
}): Promise<QuestionListItem[]> {
  const limit = Math.min(Math.max(params?.limit ?? 20, 1), 100);
  const categoryFilter = params?.categorySlug
    ? `&& category->slug.current == $categorySlug`
    : "";

  const sanityQuery = `*[_type == "question" ${categoryFilter}] | order(publishedAt desc)[0...${limit}]{
    _id,
    title,
    slug,
    publishedAt,
    questionContent,
    figmaUrl,
    author,
    category->{_id, title, slug}
  }`;

  const questions = await getClient().fetch<Question[]>(
    sanityQuery,
    params?.categorySlug ? { categorySlug: params.categorySlug } : {},
    { next: { revalidate: 60, tags: ["questions"] } },
  );
  if (questions.length === 0) return [];

  const ids = questions.map((q) => q._id);
  const supabase = await createClient();

  const [commentCountsResult, reactionCountsResult] = await Promise.all([
    supabase
      .from("question_comment_counts")
      .select("question_id, count")
      .in("question_id", ids),
    supabase
      .from("question_reaction_counts")
      .select("target_type, target_id, reaction, count")
      .eq("target_type", "question")
      .in("target_id", ids),
  ]);

  const commentMap = new Map<string, number>();
  (commentCountsResult.data ?? []).forEach((r) =>
    commentMap.set(r.question_id as string, r.count as number),
  );

  const reactionMap = new Map<string, Record<ReactionKey, number>>();
  (reactionCountsResult.data ?? []).forEach((r) => {
    const key = r.target_id as string;
    const existing = reactionMap.get(key) ?? { cheer: 0, thanks: 0, insight: 0 };
    existing[r.reaction as ReactionKey] = r.count as number;
    reactionMap.set(key, existing);
  });

  return questions.map((q) => ({
    question: q,
    commentCount: commentMap.get(q._id) ?? 0,
    reactionCounts: reactionMap.get(q._id) ?? { cheer: 0, thanks: 0, insight: 0 },
  }));
}

export async function getQuestionBySlug(slug: string): Promise<Question | null> {
  const query = `*[_type == "question" && slug.current == $slug][0]{
    _id, title, slug, publishedAt, questionContent, figmaUrl, referenceUrls, author,
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
  "id, question_id, user_id, author_name, author_avatar_url, content, created_at, updated_at";

type CommentRow = {
  id: string;
  question_id: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
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

export async function addComment(input: {
  questionId: string;
  questionSlug: string;
  content: string;
}): Promise<{ ok: true; comment: QuestionComment } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const validated = validateCommentContent(input.content);
  if (!validated.ok) return validated;

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

  const { data, error } = await supabase
    .from("question_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", input.commentId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[deleteComment]", error);
    return { ok: false, error: "コメントの削除に失敗しました" };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "コメントが見つからないか、削除する権限がありません" };
  }

  revalidatePath(`/questions/${input.questionSlug}`);
  return { ok: true };
}

// ============================================
// Supabase: スタンプ
// ============================================

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
    // 「既に押されている」＝目的の状態なので成功として扱う
    if (error.code === "23505") return { ok: true, active: true };
    console.error("[toggleReaction:insert]", error);
    return { ok: false, error: "スタンプの送信に失敗しました" };
  }
  return { ok: true, active: true };
}

/** 自分が押している reaction の一覧（一覧表示でハイライトに使う） */
export async function getMyReactions(input: {
  targetType: ReactionTarget;
  targetIds: string[];
}): Promise<Array<{ targetId: string; reaction: ReactionKey }>> {
  if (input.targetIds.length === 0) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

