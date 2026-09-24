import { cache, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getQuestionList } from "@/lib/services/questions";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { PostQuestionButton } from "@/components/questions/PostQuestionButton";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { BoardSeenRecorder } from "@/components/questions/BoardSeenRecorder";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { traceServerStep } from "@/lib/performance/server-trace";

const QUESTIONS_TITLE = "みんなの掲示板";
const QUESTIONS_DESCRIPTION =
  "デザインの話をみんなで広げて深める、メンバー同士の掲示板です。";

export const metadata = {
  title: QUESTIONS_TITLE,
  description: QUESTIONS_DESCRIPTION,
  // M-3: index対象。canonical と OG/twitter を明示（他ページと同パターン）。
  alternates: { canonical: "/questions" },
  openGraph: {
    ...OG_DEFAULTS,
    title: QUESTIONS_TITLE,
    description: QUESTIONS_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: QUESTIONS_TITLE,
    description: QUESTIONS_DESCRIPTION,
  },
};

/** 読み込み速度優先で最新6件のみ表示（新規コメントで浮上）。#140 */
const LIST_LIMIT = 6;

const getQuestionsAccess = cache(async () =>
  traceServerStep("questions.list.access", async () => {
    const [status, user] = await Promise.all([
      getSubscriptionStatus(),
      getCurrentUser(),
    ]);
    return {
      hasFullAccess: status.hasMemberAccess,
      isLoggedIn: user !== null,
    };
  })
);

async function BoardSeenBoundary() {
  const { isLoggedIn } = await getQuestionsAccess();
  return isLoggedIn ? <BoardSeenRecorder /> : null;
}

async function PostQuestionAction() {
  const { hasFullAccess, isLoggedIn } = await getQuestionsAccess();
  return (
    <PostQuestionButton
      hasMemberAccess={hasFullAccess}
      isLoggedIn={isLoggedIn}
      label="スレッドを作成"
      icon="message-square"
    />
  );
}

async function EmptyQuestionAction() {
  const { hasFullAccess, isLoggedIn } = await getQuestionsAccess();
  return (
    <PostQuestionButton
      hasMemberAccess={hasFullAccess}
      isLoggedIn={isLoggedIn}
      variant="secondary"
      label="スレッドを作成"
      icon="message-square"
    />
  );
}

export async function QuestionListContent() {
  const items = await traceServerStep("questions.list.data", () =>
    getQuestionList({ limit: LIST_LIMIT })
  );

  return (
    <>
      {items.map((item) => (
        <QuestionCard
          key={item.question._id}
          item={item}
          // 集計ViewのRLSが非会員へ0行を返すため、別の購読判定を待たず安全に描画できる。
          showEngagement
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
            <Suspense
              fallback={<div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />}
            >
              <EmptyQuestionAction />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function QuestionListSkeleton() {
  return (
    <div className="contents" aria-busy="true" aria-label="スレッドを読み込み中">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-52 w-full animate-pulse rounded-[24px] border border-border/60 bg-white"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function Page() {

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
      {/* 掲示板一覧を開いたら既読を記録し、サイドバーの新着ドットを消す（掲示板の新着ドット）。
          ログイン済みのみ。recordBoardSeen 側でも未認証は no-op。 */}
      <Suspense fallback={null}>
        <BoardSeenBoundary />
      </Suspense>
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
          <Suspense
            fallback={<div className="h-10 w-36 animate-pulse rounded-xl bg-muted" />}
          >
            <PostQuestionAction />
          </Suspense>
        </div>
      </header>

      {/* カード列（Figma 実測 max-w 752px） */}
      <div className="mx-auto mt-8 flex max-w-[752px] flex-col gap-4">
        <Suspense fallback={<QuestionListSkeleton />}>
          <QuestionListContent />
        </Suspense>
      </div>
    </div>
  );
}
