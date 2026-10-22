/**
 * テンプレート＝全コース共通: アイキャッチ（16:10）— #241
 *
 * そのコースの実レッスンの表紙（2:3）を3〜4枚、少し重ねて傾けて並べる。
 * 位置・大きさはすべてコンテナに対する % / cqw で決めているので、
 * ヒーロー（最大 560px）と一覧カードのサムネ（~500px 以下）で同じコンポーネントを使える。
 */

import { cn } from "@/lib/utils";
import type { Course, LessonMap, ResolvedLesson } from "../data/types";
import { EYECATCH_BG, LessonCover } from "./shared";

export interface CoverSpec {
  key: string;
  lesson?: ResolvedLesson | null;
  slug?: string;
  plannedTitle?: string;
}

/** 枚数ごとの並び（left / top は %、rotate は deg）。表紙の幅は 25% */
const LAYOUTS: Record<number, { left: number; top: number; rotate: number }[]> = {
  1: [{ left: 37.5, top: 14, rotate: 0 }],
  2: [
    { left: 28, top: 15, rotate: -5 },
    { left: 47, top: 13, rotate: 5 },
  ],
  3: [
    { left: 20.5, top: 18, rotate: -7 },
    { left: 37.5, top: 12, rotate: 0 },
    { left: 54.5, top: 18, rotate: 7 },
  ],
  4: [
    { left: 12, top: 19, rotate: -8 },
    { left: 29, top: 13, rotate: -2.5 },
    { left: 46, top: 13, rotate: 2.5 },
    { left: 63, top: 19, rotate: 8 },
  ],
};

/**
 * コースから表紙を最大4枚選ぶ。既存レッスンを優先し、足りなければ未制作で埋める。
 * 並びはカリキュラム順のまま。
 */
export function pickCovers(course: Course, lessons: LessonMap): CoverSpec[] {
  const items = course.steps.flatMap((step) => step.items);
  const lessonCount = items.filter((item) => item.type === "lesson").length;
  let plannedBudget = Math.max(0, 4 - lessonCount);
  const picked: CoverSpec[] = [];
  items.forEach((item, index) => {
    if (picked.length >= 4) return;
    if (item.type === "lesson") {
      picked.push({ key: item.slug, lesson: lessons[item.slug], slug: item.slug });
    } else if (plannedBudget > 0) {
      plannedBudget -= 1;
      picked.push({ key: `planned-${index}`, plannedTitle: item.title.text });
    }
  });
  return picked;
}

export default function CourseEyecatch({
  covers,
  label,
  meta,
  sizes = "(min-width: 1024px) 130px, 25vw",
  className,
  plannedLabel,
}: {
  covers: CoverSpec[];
  /** 左下のコース名ラベル */
  label: string;
  /** 右上の小さな英字メタ（例: 6 LESSONS） */
  meta?: string;
  sizes?: string;
  className?: string;
  /** 未制作の表紙のラベル（v2 は「近日公開」） */
  plannedLabel?: string;
}) {
  const shown = covers.slice(0, 4);
  const layout = LAYOUTS[shown.length] ?? [];

  return (
    <div
      className={cn(
        "@container relative aspect-[16/10] w-full overflow-hidden rounded-[32px]",
        EYECATCH_BG,
        className
      )}
    >
      {/* 白を薄くかけて、ペルソナページのヒーローの淡さに寄せる */}
      <div className="absolute inset-0 bg-surface/40" aria-hidden="true" />

      <span className="absolute left-[5%] top-[7%] font-mono text-[clamp(8px,1.7cqw,11px)] uppercase tracking-[0.14em] text-text-primary/70">
        BONO Course
      </span>
      {meta ? (
        <span className="absolute right-[5%] top-[7%] font-mono text-[clamp(8px,1.7cqw,11px)] uppercase tracking-[0.14em] text-text-primary/70">
          {meta}
        </span>
      ) : null}

      {shown.map((cover, index) => {
        const pos = layout[index];
        return (
          <div
            key={cover.key}
            className="absolute w-[25%]"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `rotate(${pos.rotate}deg)`,
              zIndex: index + 1,
            }}
          >
            <LessonCover
              lesson={cover.lesson}
              slug={cover.slug}
              plannedTitle={cover.plannedTitle}
              plannedLabel={plannedLabel}
              sizes={sizes}
              className="w-full border-[0.6cqw] border-surface shadow-[var(--shadow-lift)]"
            />
          </div>
        );
      })}

      <div className="absolute bottom-[7%] left-[5%] right-[5%] flex">
        <span className="max-w-full truncate font-heading text-[clamp(12px,2.6cqw,17px)] font-bold leading-[1.4] text-text-primary">
          {label}
        </span>
      </div>
    </div>
  );
}
