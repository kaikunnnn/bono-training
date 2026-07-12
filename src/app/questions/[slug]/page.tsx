import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { linkifyText } from "@/lib/questions/linkify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import {
  getQuestionBySlug,
  getCommentsByQuestion,
  getReactionCountsMap,
  getMyReactions,
  type ReactionKey,
} from "@/lib/services/questions";
import { emptyReactionCounts } from "@/lib/services/questions-utils";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import ContentPreviewOverlay from "@/components/premium/ContentPreviewOverlay";
import { extractPreviewText } from "@/lib/portable-text-utils";
import { QuestionCommentsSection } from "@/components/questions/QuestionCommentsSection";
import { isProfileIncomplete } from "@/lib/profile-utils";
import { ReactionButtons } from "@/components/questions/ReactionButtons";

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
      <p className="my-3 leading-7 whitespace-pre-line">
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

  if (hasFullAccess) {
    comments = await getCommentsByQuestion(question._id);

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
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/questions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          一覧へ戻る
        </Link>
      </Button>

      {/* 質問本体 */}
      <Card className="rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {question.category && (
              <Badge variant="outline">{question.category.title}</Badge>
            )}
          </div>
          <CardTitle className="text-2xl md:text-3xl">{question.title}</CardTitle>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {authorAvatar && (
                <AvatarImage src={authorAvatar} alt={authorName} />
              )}
              <AvatarFallback>{authorName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {authorName} ・ {formatDate(question.publishedAt)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                {question.referenceUrls && question.referenceUrls.length > 0 && (
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

              {/* 質問本体へのリアクション */}
              <div className="mt-6 border-t pt-4">
                <ReactionButtons
                  targetType="question"
                  targetId={question._id}
                  counts={questionReactionCounts}
                  myReactions={myQuestionReactions}
                  canReact={currentUserId !== null}
                />
              </div>
            </>
          ) : (
            <>
              <p className="whitespace-pre-line text-base text-muted-foreground leading-7">
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
        </CardContent>
      </Card>

      {/* コメント（メンバーのみ） */}
      {hasFullAccess && (
        <QuestionCommentsSection
          questionId={question._id}
          questionSlug={slug}
          initialComments={comments}
          commentReactionCounts={commentReactionCountsMap}
          myCommentReactions={myCommentReactionsByCommentId}
          currentUserId={currentUserId}
          profileIncomplete={profileIncomplete}
        />
      )}
    </div>
  );
}
