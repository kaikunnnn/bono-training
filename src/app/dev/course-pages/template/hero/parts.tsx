/**
 * テンプレート＝全コース共通: ヒーロー4パターンで使い回す部品 — #241（Figma 70:7129）
 *
 * 実測とトークン対応は rebono/issues/241-B_コースヒーロー_Figma仕様.md
 * ヒーローはコンテンツ領域の端から端まで使う（画像の帯・裁ち落としがあるため）。
 * CourseTemplateV2 に差し込むときは、max-w の器の外（上）に置く。
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course, LessonMap } from "../../data/types";
import type { WorkMockKind } from "../../data/roadmap-career-change-v3";
import WorkMock from "../../prototyping/roadmap/career-change-v3/WorkMock";
import { T } from "../kari";
import { LessonCover, splitTitle } from "../shared";

/** ヒーロー共通の受け取り */
export interface CourseHeroProps {
  course: Course;
  lessons: LessonMap;
  /** 最初のレッスン（無ければボタンを出さない） */
  startHref: string | null;
  /** 「カリキュラムを見る」の行き先（本番のページでは #curriculum） */
  curriculumHref: string;
  /** コース名の見出しレベル。ページの主見出しなら 1 */
  headingLevel?: 1 | 2;
}

/** 器（既存テンプレートと同じ幅） */
export const HERO_CONTAINER = "mx-auto w-full max-w-[1180px] px-4 md:px-10";

export function CourseBadge({ className }: { className?: string }) {
  return (
    <p className={className}>
      <span className="inline-flex h-[22px] items-center rounded-full border border-text-secondary px-2.5 text-xs font-bold leading-4 text-text-secondary">
        コース
      </span>
    </p>
  );
}

/** コース名（「：」の前）。Figma: M PLUS 1 Bold 40/54・字間 -0.02em */
export function HeroTitle({
  course,
  level = 1,
  className,
}: {
  course: Course;
  level?: 1 | 2;
  className?: string;
}) {
  const { main } = splitTitle(course.title.text);
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <Tag
      className={cn(
        "font-heading text-[32px] font-bold leading-[1.35] tracking-[-0.02em] text-text-primary [word-break:keep-all] md:text-[40px] md:leading-[54px]",
        className
      )}
    >
      {main.endsWith("コース") ? (
        <>
          {main.slice(0, -3)}
          <wbr />
          コース
        </>
      ) : (
        main
      )}
    </Tag>
  );
}

/** サブ行（「：」の後ろ）。Figma: 20/36・字間 -0.72px。weight は 02 だけ medium */
export function HeroSub({
  course,
  weight = "bold",
  className,
}: {
  course: Course;
  weight?: "bold" | "medium";
  className?: string;
}) {
  const { sub } = splitTitle(course.title.text);
  if (!sub) return null;
  return (
    <p
      className={cn(
        "font-heading text-[17px] leading-[1.7] tracking-[-0.036em] text-text-secondary md:text-[20px] md:leading-[36px]",
        weight === "bold" ? "font-bold" : "font-medium",
        className
      )}
    >
      {sub}
    </p>
  );
}

/** つくった人（24px の丸アイコン＋名前＋肩書） */
export function HeroAuthor({ course, className }: { course: Course; className?: string }) {
  const { author } = course;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-none text-text-primary", className)}>
      <Image
        src={author.image}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0 rounded-full object-cover"
      />
      <span>
        <T f={author.name} />
      </span>
      <span className="text-text-secondary">
        <T f={author.role} />
      </span>
    </p>
  );
}

/** ボタン2つ（共通 Button。Figma と寸法・色とも一致） */
export function HeroCtas({
  startHref,
  curriculumHref,
  className,
}: {
  startHref: string | null;
  curriculumHref: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {startHref ? (
        <Button asChild size="large">
          <Link href={startHref}>
            このコースを始める
            <ArrowRight strokeWidth={2.5} />
          </Link>
        </Button>
      ) : null}
      <Button asChild variant="outline-ghost" size="large">
        <a href={curriculumHref}>
          カリキュラムを見る
          <ArrowDown />
        </a>
      </Button>
    </div>
  );
}

/* ---------- 画像 ---------- */

/** Figma の下地（青〜薄紫のグラデーション画像）。親は relative */
export function FigmaGradient({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      src="/dev/course-hero/figma-gradient.png"
      alt=""
      fill
      sizes="100vw"
      unoptimized
      priority={priority}
      className="object-cover"
    />
  );
}

/** Figma の端末画像（ノートPC＋スマホ。Figma の仮画像） */
export function FigmaDevices({ className }: { className?: string }) {
  return (
    <Image
      src="/dev/course-hero/figma-devices-crop.png"
      alt="ノートPCとスマホに表示した画面の例（Figmaの仮画像）"
      width={1200}
      height={701}
      unoptimized
      className={cn("h-auto", className)}
    />
  );
}

/** コースごとの「つくるもの」の仮画像（WorkMock の種類）。対応は仮 */
const OUTCOME_MOCK: Record<string, WorkMockKind> = {
  "ui-design-first": "todo-annotated",
  "ui-design-visual": "dailyui-grid",
  "ui-experience": "flow-app",
  "ai-ui-design": "flow-saas",
};

/** つくるものの仮画像（下地なし。下地は呼ぶ側で敷く） */
export function OutcomeMock({ course, className }: { course: Course; className?: string }) {
  const kind = OUTCOME_MOCK[course.slug] ?? "flow-app";
  return <WorkMock kind={kind} rounded="rounded-none" className={cn("bg-none bg-transparent", className)} />;
}

/** 実レッスンの表紙を横に並べる（Sanity の実画像）。最大 max 枚 */
export function LessonCoverRow({
  course,
  lessons,
  max = 6,
  sizes,
  className,
  coverClassName,
}: {
  course: Course;
  lessons: LessonMap;
  max?: number;
  sizes: string;
  className?: string;
  coverClassName?: string;
}) {
  // 実レッスン（表紙の画像がある）を先に、足りない分を近日公開で埋める。並びはカリキュラム順のまま
  const all = course.steps.flatMap((s) => s.items);
  const items = [...all.filter((i) => i.type === "lesson"), ...all.filter((i) => i.type === "planned")].slice(0, max);
  const tilt = [-4, 2, -1.5, 3, -2.5, 1.5];
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {items.map((item, i) => (
        <div
          key={item.type === "lesson" ? item.slug : `planned-${i}`}
          className={cn("shrink-0", coverClassName)}
          style={{ transform: `rotate(${tilt[i % tilt.length]}deg)` }}
        >
          {item.type === "lesson" ? (
            <LessonCover
              lesson={lessons[item.slug]}
              slug={item.slug}
              sizes={sizes}
              className="w-full border-[3px] border-surface shadow-[var(--shadow-lift)]"
            />
          ) : (
            <LessonCover
              plannedTitle={item.title.text}
              plannedLabel="近日公開"
              sizes={sizes}
              className="w-full border-[3px] border-surface shadow-[var(--shadow-lift)]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
