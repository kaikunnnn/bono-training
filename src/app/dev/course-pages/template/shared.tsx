/**
 * テンプレート＝全コース共通: セクション間で使い回す小さな部品 — #241
 *
 * - SectionHead: セクション見出し（小ラベル＋h2＋リード）
 * - StepBadge: ロードマップ詳細のステップ番号バッジを寄せたもの
 * - LessonCover: レッスンの表紙（2:3）。画像がなければ灰色の表紙
 */

import Image from "next/image";
import { Cup } from "iconsax-react";
import { cn } from "@/lib/utils";
import type { Course, ResolvedLesson } from "../data/types";

/** ロードマップのバッジの淡いグラデーションを、既存トークンで組んだもの */
export const PASTEL_GRADIENT =
  "bg-[image:linear-gradient(90deg,hsl(var(--training-gradient-start))_0%,var(--persona-hero-surface)_55%,var(--bg-warm)_100%)]";

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

/** ステップ番号バッジ（size: lg=カリキュラム / sm=流れ） */
export function StepBadge({
  number,
  challenge = false,
  size = "lg",
}: {
  number?: number;
  challenge?: boolean;
  size?: "lg" | "sm";
}) {
  const lg = size === "lg";
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden bg-surface shadow-[var(--shadow-input)]",
        lg ? "w-[72px] rounded-[16px]" : "w-[56px] rounded-[12px]"
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "text-center font-bold",
          lg ? "px-2 py-1.5 text-[9px]" : "px-1.5 py-1 text-[8px]",
          challenge
            ? "bg-[image:var(--persona-cta-gradient)] text-text-inverse"
            : cn(PASTEL_GRADIENT, "text-text-primary")
        )}
      >
        {challenge ? "チャレンジ" : "ステップ"}
      </div>
      <div className={cn("flex items-center justify-center", lg ? "h-[42px]" : "h-[32px]")}>
        {challenge ? (
          <Cup size={lg ? 26 : 20} color="currentColor" variant="Bulk" className="text-text-primary" />
        ) : (
          <span
            className={cn(
              "font-latin font-bold leading-none tracking-[-0.02em] text-text-primary",
              lg ? "text-[26px]" : "text-[19px]"
            )}
          >
            {pad2(number ?? 0)}
          </span>
        )}
      </div>
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
  sizes,
  className,
}: {
  lesson?: ResolvedLesson | null;
  slug?: string;
  plannedTitle?: string;
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
              planned ? "bg-surface text-text-muted" : "bg-surface/70 text-text-muted"
            )}
          >
            {planned ? "未制作" : lesson ? "画像なし" : "未取得"}
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
