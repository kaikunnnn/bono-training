/**
 * テンプレート＝全コース共通: セクション間で使い回す小さな部品 — #241
 *
 * - SectionHead: セクション見出し（小ラベル＋h2＋リード）
 * - LessonCover: レッスンの表紙（2:3）。画像がなければ灰色の表紙
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Course, ResolvedLesson } from "../data/types";

/** ペルソナページのヒーローの雰囲気（グラデーション画像＋淡い色） */
export const EYECATCH_BG =
  "bg-[var(--persona-hero-surface)] bg-[image:url('/images/lesson-persona-ui/hero-gradient.webp')] bg-cover bg-center";

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** 「：」の前を主見出し、後ろをサブ行に分ける */
export function splitTitle(title: string): { main: string; sub: string | null } {
  const index = title.indexOf("：");
  if (index === -1) return { main: title, sub: null };
  return { main: title.slice(0, index), sub: title.slice(index + 1) };
}

/**
 * ステップに番号を振る（小ゴールだけ 01, 02… / チャレンジは null）。
 * レッスンの通し番号の開始値も一緒に返す。
 */
export function numberSteps(course: Course) {
  let goal = 0;
  let lesson = 0;
  return course.steps.map((step, index) => {
    const goalNumber = step.kind === "goal" ? ++goal : null;
    const firstLessonOrder = lesson + 1;
    lesson += step.items.length;
    return { step, index, goalNumber, firstLessonOrder };
  });
}

export function courseCounts(course: Course) {
  const items = course.steps.flatMap((step) => step.items);
  return {
    lessons: items.length,
    planned: items.filter((item) => item.type === "planned").length,
    goals: course.steps.filter((step) => step.kind === "goal").length,
    hasChallenge: course.steps.some((step) => step.kind === "challenge"),
  };
}

export function SectionHead({
  kicker,
  title,
  lead,
  id,
}: {
  kicker: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  id: string;
}) {
  return (
    <div className="max-w-[640px]">
      <p className="font-mono text-[11px] uppercase leading-[1.5] tracking-[0.12em] text-text-muted">
        {kicker}
      </p>
      <h2
        id={id}
        className="mt-3 font-heading text-[26px] font-bold leading-[1.45] tracking-[-0.04em] text-text-primary md:text-[32px]"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-3 text-sm leading-[1.9] text-text-secondary md:text-[15px]">{lead}</p>
      ) : null}
    </div>
  );
}

/**
 * レッスンの表紙（2:3）。幅は親で決める（className で w- を渡す）。
 * - lesson に画像あり → Sanity の画像（unoptimized：Vercel 画像最適化 402 回避）
 * - 画像なし／取得できない slug → 灰色の表紙にタイトル or slug
 * - planned → 灰色の表紙に「未制作」
 */
export function LessonCover({
  lesson,
  slug,
  plannedTitle,
  plannedLabel = "未制作",
  sizes,
  className,
}: {
  lesson?: ResolvedLesson | null;
  slug?: string;
  plannedTitle?: string;
  /** 未制作の表紙に出すラベル（v2 は「近日公開」） */
  plannedLabel?: string;
  sizes: string;
  className?: string;
}) {
  const image = lesson?.iconImageUrl;
  const planned = plannedTitle !== undefined;

  return (
    <div
      className={cn(
        "@container relative aspect-[2/3] shrink-0 overflow-hidden rounded-l-[3px] rounded-r-[8px]",
        image ? "bg-muted-strong" : planned ? "bg-muted-custom" : "bg-muted-strong",
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={lesson?.title ?? ""}
          fill
          sizes={sizes}
          unoptimized
          className="object-cover"
        />
      ) : planned && plannedTitle === "" ? null : (
        <div className="absolute inset-0 flex flex-col justify-between p-[10cqw]">
          <span
            className={cn(
              "self-start rounded-[3px] px-[5cqw] py-[1.5cqw] text-[8.5cqw] font-bold leading-[1.4]",
              "border border-text-primary/15 text-text-muted"
            )}
          >
            {planned ? plannedLabel : lesson ? "画像なし" : "未取得"}
          </span>
          <span
            className={cn(
              "line-clamp-5 text-[10cqw] font-bold leading-[1.35] text-text-muted",
              !planned && !lesson && "font-mono"
            )}
          >
            {planned ? plannedTitle : lesson ? lesson.title : slug}
          </span>
        </div>
      )}
      {/* 背表紙の折り目 */}
      <span className="pointer-events-none absolute inset-y-0 left-[5%] w-px bg-text-primary/10" aria-hidden="true" />
    </div>
  );
}

/** 分 → 「約45分」「約2時間40分」 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `約${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `約${h}時間` : `約${h}時間${m}分`;
}
