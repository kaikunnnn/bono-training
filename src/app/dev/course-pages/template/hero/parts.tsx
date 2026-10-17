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
  /** 進めているコースのとき「進めているコース」の印を足す（#243 ?started=1） */
  started?: boolean | null;
  /** 続きから（あれば「このコースを始める」の代わりに出す） */
  resume?: HeroResume | null;
}

/** 「続きから」ボタンの中身 */
export interface HeroResume {
  href: string;
  title: string;
}

/** 器（既存テンプレートと同じ幅） */
export const HERO_CONTAINER = "mx-auto w-full max-w-[1180px] px-4 md:px-10";

export function CourseBadge({ started = null, className }: { started?: boolean | null; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="inline-flex h-[22px] items-center rounded-full border border-text-secondary px-2.5 text-xs font-bold leading-4 text-text-secondary">
        コース
      </span>
      {started ? (
        <span className="inline-flex h-[22px] items-center rounded-full bg-text-primary px-2.5 text-xs font-bold leading-4 text-text-inverse">
          進めているコース
        </span>
      ) : null}
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
  resume = null,
  className,
}: {
  startHref: string | null;
  curriculumHref: string;
  resume?: HeroResume | null;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {resume ? (
        <Button asChild size="large" className="h-auto min-h-12 whitespace-normal py-2.5 text-left">
          <Link href={resume.href}>
            <span>
              <span className="block text-[11px] font-medium opacity-80">続きから</span>
              {resume.title}
            </span>
            <ArrowRight strokeWidth={2.5} />
          </Link>
        </Button>
      ) : startHref ? (
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

/**
 * Figma の画像（Course2026 80:7141）。ノートPC＋スマホの端末画像がやわらかいグラデの上に載ったもの。
 * どちらも親いっぱいに cover で敷く（親は relative ＋ 寸法あり）。端末は画像の中央にあるので中央基準で切る。
 */
const HERO_IMAGE_ALT = "ノートPCとスマホに表示した画面の例";

/** 横長（1370×590・Figma 80:7131）。03・04 の帯で使う */
export function HeroImageWide({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      src="/dev/course-hero/hero-wide.png"
      alt={HERO_IMAGE_ALT}
      fill
      sizes="100vw"
      unoptimized
      priority={priority}
      className="object-cover object-center"
    />
  );
}

/** ほぼ正方形（581×559・Figma 80:7139）。01 の右パネル・02 の1枚目のカードで使う */
export function HeroImageSquare({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      src="/dev/course-hero/hero-square.png"
      alt={HERO_IMAGE_ALT}
      fill
      sizes="(min-width: 1024px) 581px, 100vw"
      unoptimized
      priority={priority}
      className="object-cover object-center"
    />
  );
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
