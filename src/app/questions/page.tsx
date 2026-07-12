import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare } from "lucide-react";
import { getQuestionList } from "@/lib/services/questions";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { extractPreviewText } from "@/lib/portable-text-utils";
import { PostQuestionButton } from "@/components/questions/PostQuestionButton";

export const metadata = {
  title: "みんなの掲示板",
  description: "メンバー同士で質問やアイデアを共有する場所",
};

const PREVIEW_LINES_FOR_GUEST = 3;

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export default async function Page() {
  const [items, status, user] = await Promise.all([
    getQuestionList({ limit: 20 }),
    getSubscriptionStatus(),
    getCurrentUser(),
  ]);

  const hasFullAccess = status.hasMemberAccess;
  const isLoggedIn = user !== null;

  return (
    <div className="container py-10">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">みんなの掲示板</h1>
            <Badge variant="secondary" className="text-xs">
              β
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            学習や制作の気づきを共有して、メンバー同士で励まし合う場所です。
          </p>
        </div>
        <PostQuestionButton
          hasMemberAccess={hasFullAccess}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* 一覧 */}
      <div className="mt-8 grid gap-4">
        {items.map(({ question, commentCount, reactionCounts }) => {
          const reactionTotal =
            reactionCounts.cheer + reactionCounts.thanks + reactionCounts.insight;
          const fullText = extractPreviewText(question.questionContent, 1000);
          const previewText = extractPreviewText(
            question.questionContent,
            PREVIEW_LINES_FOR_GUEST,
          );
          const bodyText = hasFullAccess ? fullText : previewText;
          const authorName = question.author?.displayName || "メンバー";
          const authorAvatar = question.author?.avatarUrl;

          return (
            <Link
              key={question._id}
              href={`/questions/${question.slug.current}`}
              className="block"
            >
              <Card className="group rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-200 hover:shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {question.category && (
                      <Badge variant="outline">{question.category.title}</Badge>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      {authorAvatar && (
                        <AvatarImage src={authorAvatar} alt={authorName} />
                      )}
                      <AvatarFallback>{authorName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-xl transition-colors group-hover:text-primary">
                        {question.title}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {authorName} ・ {formatDate(question.publishedAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="whitespace-pre-line text-base text-muted-foreground leading-7">
                    {bodyText}
                  </p>

                  {/* コメント/スタンプ数はRLSにより非メンバーには常に0で返るため、
                      誤解を招く「0件」表示を避けてメンバーのみに見せる */}
                  {hasFullAccess && (
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        コメント {commentCount}件
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        スタンプ {reactionTotal}件
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {/* Empty状態はBONOのステート原則に従い「情報がない」ではなくアクションを促す（#137-B） */}
        {items.length === 0 && (
          <Card className="rounded-2xl border border-border/60 bg-white">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div>
                <p className="text-base font-medium">最初の質問を投稿してみよう</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  デザインの悩みや聞いてみたいことを、メンバーと共有できます。
                </p>
              </div>
              <PostQuestionButton
                hasMemberAccess={hasFullAccess}
                isLoggedIn={isLoggedIn}
                variant="secondary"
                label="最初の質問を投稿する"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
