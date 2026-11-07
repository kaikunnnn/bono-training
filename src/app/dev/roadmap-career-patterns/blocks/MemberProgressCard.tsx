/**
 * パターンK：ログイン中の「現在地と次の1本」（#295 案4）
 * 例示の固定データ。実ユーザーの進捗は読まない。計測も足さない。
 * 進む目安の文は解説記事の「出すアウトプット」そのまま。
 */

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { Book } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";
import { ProvisionalTag } from "../parts";
import type { FirstOneView } from "../guide-utils";

export default function MemberProgressCard({
  steps,
  currentStepKey,
  lesson,
  completedArticles,
  criteria,
}: {
  steps: SanityRoadmapStep[];
  currentStepKey: string;
  /** 解決できないときは「次の1本」を出さない */
  lesson: FirstOneView | null;
  completedArticles: number;
  criteria: readonly string[];
}) {
  const currentIndex = steps.findIndex((s) => s._key === currentStepKey);
  if (currentIndex === -1) {
    console.warn(`[dev/roadmap-career-patterns] 例示のステップが見つかりません: ${currentStepKey}`);
    return null;
  }
  const currentStep = steps[currentIndex];
  const nextStep = steps[currentIndex + 1];
  const total = lesson?.articleCount ?? 0;

  return (
    <section id="member-progress" className="scroll-mt-20 px-4 pt-6 md:px-8">
      <div className="mx-auto max-w-[720px] rounded-[20px] border border-border-light bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-bold leading-[28px] text-text-primary">あなたの現在地</h2>
          <ProvisionalTag>試作・表示は例</ProvisionalTag>
        </div>

        {/* 進み具合 */}
        <ol className="mt-3 flex gap-1.5" aria-label={`全${steps.length}ステップの進み具合`}>
          {steps.map((step, index) => {
            const done = index < currentIndex;
            const current = index === currentIndex;
            return (
              <li
                key={step._key}
                aria-current={current ? "step" : undefined}
                className={
                  done
                    ? "flex h-8 min-w-0 flex-1 items-center justify-center rounded-[8px] bg-cta-primary-bg text-text-inverse"
                    : current
                      ? "flex h-8 min-w-0 flex-1 items-center justify-center rounded-[8px] border-2 border-cta-primary-bg text-[13px] font-bold text-text-primary"
                      : "flex h-8 min-w-0 flex-1 items-center justify-center rounded-[8px] bg-muted-custom text-[13px] text-text-muted"
                }
              >
                {done ? <Check aria-hidden="true" className="size-4" strokeWidth={3} /> : index + 1}
                <span className="sr-only">
                  {done ? `ステップ${index + 1} 完了` : current ? `ステップ${index + 1} いまここ` : `ステップ${index + 1} これから`}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[14px] leading-[22px] text-text-secondary">
          <span className="font-bold text-text-primary">
            ステップ{currentIndex + 1} / {steps.length}
          </span>
          ：{currentStep.title}
        </p>

        {/* 次の1本 */}
        {lesson && (
          <div className="mt-5 border-t border-border-light pt-5">
            <h3 className="text-[14px] font-bold leading-[22px] text-text-muted">次の1本</h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative flex h-[72px] w-12 shrink-0 items-center justify-center overflow-hidden rounded-r-[6px] bg-muted-custom shadow-sm">
                {lesson.imageUrl ? (
                  <Image src={lesson.imageUrl} alt="" fill sizes="48px" unoptimized className="object-cover" />
                ) : (
                  <Book aria-hidden="true" size={20} color="currentColor" className="text-text-muted" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[16px] font-bold leading-[24px] text-text-primary">{lesson.title}</h4>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress
                    value={total > 0 ? (completedArticles / total) * 100 : 0}
                    aria-label="レッスンの進み具合"
                    className="h-1.5 bg-muted-custom [&>div]:bg-cta-primary-bg"
                  />
                  <span className="shrink-0 text-[13px] font-bold leading-[20px] text-text-primary">
                    {completedArticles}/{total}本
                  </span>
                </div>
              </div>
            </div>
            <Button asChild size="large" className="mt-4 w-full sm:w-auto">
              <Link href={lesson.href}>続きを見る</Link>
            </Button>
          </div>
        )}

        {/* 次のステップへ進む目安 */}
        <div className="mt-5 border-t border-border-light pt-5">
          <h3 className="text-[14px] font-bold leading-[22px] text-text-muted">次のステップへ進む目安</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {criteria.map((text) => (
              <li key={text} className="flex gap-2 text-[14px] leading-[22px] text-text-primary">
                <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-text-muted" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* 先のステップへ */}
        {nextStep && (
          <Button asChild variant="outline-ghost" className="mt-4 h-auto min-h-10 w-full whitespace-normal py-2 text-left">
            <a href={`#curriculum-step-${currentIndex + 2}`}>
              <span className="min-w-0 flex-1">
                先のステップを見る：ステップ{currentIndex + 2} {nextStep.title}
              </span>
              <ChevronDown aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
