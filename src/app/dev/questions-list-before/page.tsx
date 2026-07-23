import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { getQuestionList } from "@/lib/services/questions";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { PostQuestionButton } from "@/components/questions/PostQuestionButton";
import { QuestionCardBefore20260721 } from "@/components/questions/_snapshots/QuestionCardBefore20260721";

/**
 * /dev/questions-list-before — 掲示板一覧の「変更前」凍結スナップショット（2026-07-21）。
 * #153（一覧の速度改善 + コメント者アイコン表示）着手前の見た目・データ取得を保存し、
 * 実装後の /questions といつでも見比べられるようにする。データ取得は実際の
 * getQuestionList を使うため、着手前の実データがそのまま表示される。
 * このページは以後も更新しない（比較用の固定リファレンス）。
 */
export const metadata: Metadata = {
  title: "掲示板一覧 変更前スナップショット (/dev/questions-list-before)",
  robots: { index: false, follow: false },
};

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
      <div className="mx-auto mb-8 max-w-[752px] rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        📌 これは #153（一覧の速度改善＋コメント者アイコン表示）着手前の凍結スナップショットです。
        本番の見た目とは今後ズレていきます（比較用に固定）。
      </div>

      <header className="mx-auto flex max-w-[752px] flex-col items-center gap-2 pt-6 text-center">
        <p className="text-sm text-muted-foreground">Q&amp;A</p>
        <h1 className="font-rounded-mplus-bold text-4xl text-foreground md:text-5xl">
          みんなの掲示板
        </h1>
        <p className="text-[15px] text-muted-foreground">
          デザインの話をみんなで広げて深めよう
        </p>
        <div className="pt-4">
          <PostQuestionButton
            hasMemberAccess={hasFullAccess}
            isLoggedIn={isLoggedIn}
            label="スレッドを作成"
            icon="message-square"
          />
        </div>
      </header>

      <div className="mx-auto mt-8 flex max-w-[752px] flex-col gap-4">
        {items.map((item) => (
          <QuestionCardBefore20260721
            key={item.question._id}
            item={item}
            showEngagement={hasFullAccess}
          />
        ))}

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
                icon="message-square"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
