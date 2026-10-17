/**
 * ヒーロー パターン02: 見出し＋カード3枚 — #241（Figma 70:5756）
 *
 * 上の段: 左にバッジ＋コース名、右にサブ行（Regular → font-medium で近似）。つくった人は無し。
 * その下にボタン、さらに下に同じ大きさのカード3枚（371×444・角丸24）。
 * Figma は1枚目だけ端末画像・2〜3枚目は空なので、2〜3枚目は中身を足した:
 *   1. Figma の端末画像（80:7139）をカードいっぱいに cover
 *   2. 使うレッスン（Sanity の実レッスン表紙）
 *   3. 進め方（ステップ名の並び・コースのデータ）
 * スマホ: 上の段は縦積み、カードは横スクロール（約80%幅・スナップ）。
 */

import { cn } from "@/lib/utils";
import { T } from "../kari";
import { numberSteps, pad2 } from "../shared";
import {
  CourseBadge,
  type CourseHeroProps,
  HERO_CONTAINER,
  HeroCtas,
  HeroImageSquare,
  HeroSub,
  HeroTitle,
  LessonCoverRow,
} from "./parts";

const CARD =
  "relative aspect-[371/444] w-[80%] shrink-0 snap-start overflow-hidden rounded-[24px] bg-muted-strong sm:w-[46%] md:w-auto";

function CardLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <p className="absolute left-5 top-4 z-10 flex items-baseline gap-2 text-xs font-bold text-text-secondary">
      <span className="font-mono text-[11px] tracking-[0.12em] text-text-muted">{pad2(index)}</span>
      {children}
    </p>
  );
}

export default function CourseHeroCards({
  course,
  lessons,
  startHref,
  curriculumHref,
  headingLevel = 1,
  started = null,
  resume = null,
}: CourseHeroProps) {
  const steps = numberSteps(course);

  return (
    <section className="w-full">
      <div className={cn(HERO_CONTAINER, "pb-10 pt-10 lg:pt-24")}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,492px)_minmax(0,570px)] lg:items-end lg:justify-between lg:gap-10">
          <div>
            <CourseBadge started={started} />
            <HeroTitle course={course} level={headingLevel} className="mt-[15px]" />
          </div>
          <HeroSub course={course} weight="medium" />
        </div>
        <HeroCtas
          startHref={startHref}
          resume={resume}
          curriculumHref={curriculumHref}
          className="mt-6 lg:mt-[26px]"
        />

        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:mt-[52px]">
          {/* 1. Figma の端末画像 */}
          <li className={CARD}>
            <HeroImageSquare />
          </li>

          {/* 2. 使うレッスン（実画像） */}
          <li className={CARD}>
            <CardLabel index={2}>使うレッスン</CardLabel>
            <LessonCoverRow
              course={course}
              lessons={lessons}
              max={3}
              sizes="(min-width: 768px) 120px, 26vw"
              className="absolute inset-0 px-[8%]"
              coverClassName="-mx-[2%] w-[36%]"
            />
          </li>

          {/* 3. 進め方（ステップ名） */}
          <li className={cn(CARD, "flex flex-col")}>
            <CardLabel index={3}>進め方</CardLabel>
            <ol className="mt-12 flex flex-1 flex-col justify-center gap-3 px-5 pb-6 md:px-6">
              {steps.map(({ step, goalNumber }, i) => (
                <li key={i} className="flex flex-col gap-0.5 border-l-2 border-text-primary/15 pl-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                    {step.kind === "challenge" ? "Challenge" : `Step ${pad2(goalNumber ?? 0)}`}
                  </span>
                  <span className="line-clamp-2 text-[13px] font-bold leading-[1.5] text-text-primary">
                    <T f={step.title} />
                  </span>
                </li>
              ))}
            </ol>
          </li>
        </ul>
      </div>
    </section>
  );
}
