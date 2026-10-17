/**
 * テンプレート v2: ヒーロー4パターン（01〜04）を使うときの、ヒーロー直下の概要 — #241
 *
 * Figma のヒーローには置き場の無い v2 ヒーローの項目をここにまとめる（コンパクトに）。
 * - こんな人向け（1行）＋説明文
 * - 期間・ステップ・レッスン数・動画時間（Figma「このコースで目指す状態」のメタ行の形）
 * - 料金の一文（進行中は代わりに進み具合）
 * 下に続くセクションと重ねないため、得られる変化（→ このコースで目指す状態）と制作物（→ つくるもの）は出さない。
 */

import { Profile2User } from "iconsax-react";
import type { Course, CourseV2 } from "../../data/types";
import { T } from "../kari";
import { ProgressBar } from "../path";
import type { CourseProgress } from "../progress";
import { courseCounts, formatMinutes } from "../shared";
import PriceNote from "./PriceNote";

export default function HeroSummary({
  course,
  v2,
  progress,
  totalMinutes,
}: {
  course: Course;
  v2: CourseV2;
  progress: CourseProgress | null;
  totalMinutes: number | null;
}) {
  const counts = courseCounts(course);
  const published = counts.lessons - counts.planned;

  const meta: { label: string; value: React.ReactNode }[] = [
    { label: "期間", value: <T f={course.period} /> },
    { label: "ステップ", value: `${counts.goals}${counts.hasChallenge ? "＋チャレンジ" : ""}` },
    {
      label: "レッスン",
      value: (
        <>
          公開中 {published}本
          {counts.planned > 0 ? <span className="font-medium text-text-muted">・近日 {counts.planned}本</span> : null}
        </>
      ),
    },
    ...(totalMinutes ? [{ label: "動画", value: formatMinutes(totalMinutes) }] : []),
  ];

  return (
    <div className="grid gap-6 pb-12 pt-10 md:pb-16 md:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-start lg:gap-12">
      <div className="min-w-0">
        <p className="flex items-start gap-2 text-[15px] font-bold leading-[1.7] text-text-primary">
          <Profile2User size={18} color="currentColor" variant="Linear" className="mt-[3px] shrink-0" />
          <span>
            <T f={v2.audienceLine} />
          </span>
        </p>
        <p className="mt-2 max-w-[560px] text-sm leading-[1.9] text-text-secondary md:text-[15px]">
          <T f={course.tagline} />
        </p>
      </div>

      <div className="min-w-0">
        <dl className="grid grid-cols-2 gap-y-3 rounded-[13px] border border-border-default px-5 py-3 sm:flex sm:items-center sm:justify-between sm:gap-3 md:px-6">
          {meta.map((m, i) => (
            <div key={m.label} className="flex items-center gap-3">
              {i > 0 ? <span aria-hidden="true" className="hidden h-6 w-px bg-border-default sm:block" /> : null}
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-text-primary">{m.label}</dt>
                <dd className="text-sm font-bold text-text-primary">{m.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        {progress ? (
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar value={progress.percent} className="h-1.5 flex-1" />
            <span className="shrink-0 text-xs font-bold text-text-secondary">
              {progress.percent}% 完了・記事 {progress.articlesDone}/{progress.articlesTotal}
            </span>
          </div>
        ) : (
          <PriceNote className="mt-4" />
        )}
      </div>
    </div>
  );
}
