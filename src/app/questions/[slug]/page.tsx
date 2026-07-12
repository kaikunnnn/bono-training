import { Fragment, Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { linkifyText } from "@/lib/questions/linkify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import {
  getQuestionBySlug,
  getCommentsByQuestion,
  getReactionCountsMap,
  getMyReactions,
  type ReactionKey,
} from "@/lib/services/questions";
import { emptyReactionCounts } from "@/lib/services/questions-utils";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import ContentPreviewOverlay from "@/components/premium/ContentPreviewOverlay";
import { extractPreviewText } from "@/lib/portable-text-utils";
import { QuestionCommentsSection } from "@/components/questions/QuestionCommentsSection";
import { isProfileIncomplete } from "@/lib/profile-utils";
import { ReactionButtons } from "@/components/questions/ReactionButtons";
import { RelatedThreadsSection } from "@/components/questions/RelatedThreadsSection";

/** 単一スレッドのコメント件数（非メンバーのメタ表示用。集計 view を read-only 参照） */
async function getCommentCount(questionId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_comment_counts")
    .select("count")
    .eq("question_id", questionId)
    .maybeSingle();
  return (data?.count as number | undefined) ?? 0;
}

const PREVIEW_LINES_FOR_GUEST = 3;

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// DS のリンクスタイル（text-text-link は globals.css の --color-text-link に対応）。
// 自動リンク化・明示的な link マーク・その他の外部リンクで共通利用する。
const DS_LINK_CLASS = "text-text-link underline break-all";

/**
 * PortableText の block に渡される children を走査し、プレーンな文字列ノード内の
 * http/https URL をレンダー時に自動リンク化する。
 *
 * marks（strong/em/code/link 等）は文字列ではなく React 要素として渡ってくるため、
 * ここでは触らず素通しする。結果として「マーク無しの生テキスト中の URL」だけが
 * 自動リンク化され、既存の link マークのスタイルとは競合しない。
 */
function linkifyChildren(children: ReactNode): ReactNode {
  if (typeof children === "string") {
    return renderLinkifiedString(children);
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        return <Fragment key={i}>{renderLinkifiedString(child)}</Fragment>;
      }
      return child;
    });
  }
  return children;
}

function renderLinkifiedString(text: string): ReactNode {
  const segments = linkifyText(text);
  // URL を含まない（text セグメント 1 つだけ）の場合は文字列のまま返す
  if (segments.length === 1 && segments[0].type === "text") {
    return segments[0].value;
  }
  return segments.map((seg, i) => {
    if (seg.type === "link") {
      return (
        <a
          key={i}
          href={seg.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={DS_LINK_CLASS}
        >
          {seg.label}
        </a>
      );
    }
    return <Fragment key={i}>{seg.value}</Fragment>;
  });
}

const ptComponents: PortableTextComponents = {
  block: {
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 text-lg font-bold">{linkifyChildren(children)}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-muted pl-4 italic text-muted-foreground">
        {linkifyChildren(children)}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="my-3 text-[18px] leading-9 whitespace-pre-line text-foreground">
        {linkifyChildren(children)}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1 py-0.5 text-sm">{children}</code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={DS_LINK_CLASS}
      >
        {children}
      </a>
    ),
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const [question, status, currentUser] = await Promise.all([
    getQuestionBySlug(slug),
    getSubscriptionStatus(),
    getCurrentUser(),
  ]);

  if (!question) notFound();

  const hasFullAccess = status.hasMemberAccess;
  const authorName = question.author?.displayName || "メンバー";
  const authorAvatar = question.author?.avatarUrl;
  const currentUserId = currentUser?.id ?? null;
  // 入力フォームのアバター表示用（ログインユーザー自身の表示名・アイコン）
  const currentUserMeta = currentUser?.user_metadata ?? {};
  const currentUserName =
    (currentUserMeta.display_name as string | undefined) ||
    (currentUserMeta.name as string | undefined) ||
    "メンバー";
  const currentUserAvatarUrl =
    (currentUserMeta.avatar_url as string | undefined) ?? null;
  // 表示名・アイコンが未設定なら、コメント完了後に設定を促す（#142。未ログインは false）
  const profileIncomplete = currentUser
    ? isProfileIncomplete(currentUser.user_metadata)
    : false;

  // メンバーのみコメントとリアクションを取得
  let comments: Awaited<ReturnType<typeof getCommentsByQuestion>> = [];
  let questionReactionCounts = emptyReactionCounts();
  let commentReactionCountsMap: Record<string, Record<ReactionKey, number>> = {};
  let myQuestionReactions: ReactionKey[] = [];
  const myCommentReactionsByCommentId: Record<string, ReactionKey[]> = {};
  // メタ表示用のコメント件数（メンバーは取得済みの comments から、非メンバーは view から）
  let commentCount = 0;

  if (hasFullAccess) {
    comments = await getCommentsByQuestion(question._id);
    commentCount = comments.length;

    // 質問本体のリアクション
    const qReactionMap = await getReactionCountsMap({
      targetType: "question",
      targetIds: [question._id],
    });
    questionReactionCounts = qReactionMap[question._id] ?? emptyReactionCounts();

    // コメントのリアクションを 1 クエリで集計
    if (comments.length > 0) {
      const commentIds = comments.map((c) => c.id);
      commentReactionCountsMap = await getReactionCountsMap({
        targetType: "comment",
        targetIds: commentIds,
      });
    }

    // 自分が押しているリアクション（質問 + コメント）を取得
    if (currentUserId) {
      const [qMine, cMine] = await Promise.all([
        getMyReactions({
          targetType: "question",
          targetIds: [question._id],
        }),
        comments.length > 0
          ? getMyReactions({
              targetType: "comment",
              targetIds: comments.map((c) => c.id),
            })
          : Promise.resolve([]),
      ]);
      myQuestionReactions = qMine.map((r) => r.reaction);
      cMine.forEach((r) => {
        if (!myCommentReactionsByCommentId[r.targetId]) {
          myCommentReactionsByCommentId[r.targetId] = [];
        }
        myCommentReactionsByCommentId[r.targetId].push(r.reaction);
      });
    }
  } else {
    commentCount = await getCommentCount(question._id);
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-10 sm:px-6">
      {/* 掲示板へ戻る（共通コンポーネント） */}
      <BackButton label="掲示板へ戻る" href="/questions" />

      {/* タイトルブロック */}
      <div className="mt-6 border-b border-border pb-8">
        {/* 現在地表示：他リンクから来ても迷わないためのラベル */}
        <p className="text-[13px] font-medium text-muted-foreground">
          みんなの掲示板
        </p>
        <h1 className="mt-2 font-rounded-mplus text-[22px] font-bold leading-8 text-foreground sm:text-[30px] sm:leading-9">
          {question.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {question.category && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[14px] font-medium text-primary">
              {question.category.title}
            </span>
          )}
          <span className="flex items-center gap-1 text-[14px] text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            {commentCount} 件のコメント
          </span>
          <span className="text-[14px] text-muted-foreground">
            {formatDate(question.publishedAt)}
          </span>
        </div>
      </div>

      {/* 元の投稿ブロック */}
      <div className="mt-8">
        {/* ヘッダー行：アバター（カード外）＋投稿者名 */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border bg-muted">
            {authorAvatar && <AvatarImage src={authorAvatar} alt={authorName} />}
            <AvatarFallback>{authorName.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="text-[15px] font-medium text-foreground">
            {authorName}
          </span>
        </div>

        {/* 本文カード：ヘッダー行からインデント（sm未満は解除） */}
        <div className="mt-4 pl-0 sm:pl-[52px]">
          <div className="w-full rounded-[16px] border border-border bg-surface p-5">
            {hasFullAccess ? (
              <>
                <div className="prose prose-sm max-w-none">
                  <PortableText
                    value={question.questionContent ?? []}
                    components={ptComponents}
                  />
                  {question.figmaUrl && (
                    <p className="mt-4 text-sm">
                      <a
                        href={question.figmaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        🎨 Figmaファイルを見る
                      </a>
                    </p>
                  )}
                  {question.referenceUrls &&
                    question.referenceUrls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">参考URL</p>
                        <ul className="mt-1 space-y-1 text-sm">
                          {question.referenceUrls.map((ref) => (
                            <li key={ref._key}>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                {ref.title || ref.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </>
            ) : (
              <>
                <p className="whitespace-pre-line text-base leading-7 text-muted-foreground">
                  {extractPreviewText(
                    question.questionContent,
                    PREVIEW_LINES_FOR_GUEST,
                  )}
                </p>
                <div className="mt-6">
                  <ContentPreviewOverlay
                    isLoggedIn={status.isLoggedIn}
                    redirectTo={`/questions/${slug}`}
                  />
                </div>
              </>
            )}
          </div>

          {/* 元の投稿へのリアクション（インデント内・カード下） */}
          {hasFullAccess && (
            <div className="mt-4">
              <ReactionButtons
                targetType="question"
                targetId={question._id}
                counts={questionReactionCounts}
                myReactions={myQuestionReactions}
                canReact={currentUserId !== null}
              />
            </div>
          )}
        </div>
      </div>

      {/* コメント（メンバーのみ） */}
      {hasFullAccess && (
        <QuestionCommentsSection
          questionId={question._id}
          questionSlug={slug}
          initialComments={comments}
          commentReactionCounts={commentReactionCountsMap}
          myCommentReactions={myCommentReactionsByCommentId}
          currentUserId={currentUserId}
          currentUserAvatarUrl={currentUserAvatarUrl}
          currentUserName={currentUserName}
          profileIncomplete={profileIncomplete}
        />
      )}

      {/*
        関連する・最近のスレッド（#140 スライスD）。
        詳細ページ本体の初期表示を止めないよう Suspense でストリーミング（遅延ロード）。
        データ取得は RelatedThreadsSection 内に閉じている。
      */}
      <Suspense fallback={null}>
        <RelatedThreadsSection
          currentQuestionId={question._id}
          categorySlug={question.category?.slug?.current}
          showEngagement={hasFullAccess}
        />
      </Suspense>
    </div>
  );
}
