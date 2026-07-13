import { Card, CardContent } from "@/components/ui/card";
import { getQuestionList } from "@/lib/services/questions";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { PostQuestionButton } from "@/components/questions/PostQuestionButton";
import { QuestionCard } from "@/components/questions/QuestionCard";

export const metadata = {
  title: "みんなの掲示板",
  description: "デザインの話をみんなで広げて深める、メンバー同士の掲示板です。",
};

/** 読み込み速度優先で最新6件のみ表示（新規コメントで浮上）。#140 */
const LIST_LIMIT = 6;

export default async function Page() {
  const [items, status, user] = await Promise.all([
    getQuestionList({ limit: LIST_LIMIT }),
    getSubscriptionStatus(),
    getCurrentUser(),
  ]);

  const hasFullAccess = status.hasMemberAccess;
  const isLoggedIn = user !== null;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
      {/* センター揃えヘッダー（Figma 13:1437）。
          Figma原値は上余白48px(pt-12)だが、グローバルヘッダーが上に積み上がるため
          体感が広すぎる。24px(pt-6)に詰めて調整（T4・レビューで微調整）。 */}
      <header className="mx-auto flex max-w-[752px] flex-col items-center gap-2 pt-6 text-center">
        <p className="text-sm text-muted-foreground">Q&amp;A</p>
        <h1 className="font-rounded-mplus-bold text-4xl text-foreground md:text-5xl">
          みんなの掲示板
        </h1>
        <p className="text-[15px] text-muted-foreground">
          デザインの話をみんなで広げて深めよう
        </p>
        <div className="pt-4">
          {/* Buttonのスタイルは全サイズ統一（defaultサイズ = Figma 13:1446 の h-40/rounded-12 と一致） */}
          <PostQuestionButton
            hasMemberAccess={hasFullAccess}
            isLoggedIn={isLoggedIn}
            label="スレッドを作成"
            icon="square-pen"
          />
        </div>
      </header>

      {/* カード列（Figma 実測 max-w 752px） */}
      <div className="mx-auto mt-8 flex max-w-[752px] flex-col gap-4">
        {items.map((item) => (
          <QuestionCard
            key={item.question._id}
            item={item}
            showEngagement={hasFullAccess}
          />
        ))}

        {/* Empty状態はBONOのステート原則に従い「情報がない」ではなくアクションを促す（#137-B） */}
        {items.length === 0 && (
          <Card className="rounded-2xl border border-border/60 bg-white">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div>
                <p className="text-base font-medium">
                  最初のスレッドを立ててみよう
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  デザインの気づきや聞いてみたいことを、メンバーと共有できます。
                </p>
              </div>
              <PostQuestionButton
                hasMemberAccess={hasFullAccess}
                isLoggedIn={isLoggedIn}
                variant="secondary"
                label="スレッドを作成"
                icon="square-pen"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
