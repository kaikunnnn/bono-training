/**
 * v6 の共通部品（Server）— #243 / 243-C 計画 §1
 *
 * A（全体）・B（ステップ詳細）・C（ゴール解説）で同じ形を使う。
 * - 見た目の土台はペルソナページ（小さな英字の見出し＋M PLUS 1 の見出し＋本文 16px）
 * - 押せるカードは translateY(-2px) と、あらかじめ置いた影の不透明度だけを動かす（影そのものは動かさない）
 * - スキルのタグは色ではなく形で区別（足切り＝実線の枠／差がつく＝塗り／ポテンシャル＝破線の枠）
 */

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import {
  Brush2,
  Figma,
  Hierarchy,
  Layer,
  Magicpen,
  MessageText,
  Profile2User,
  Repeat,
  Routing,
} from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCourse } from "../../../../data";
import type { LessonMap } from "../../../../data/types";
import {
  SKILL_TAG_LABEL,
  type Para,
  type SkillTag,
  type V6CourseRef,
  type V6Icon,
  type V6Step,
} from "../../../../data/roadmap-career-change-v6";
import CourseEyecatch, { pickCovers } from "../../../../template/CourseEyecatch";
import { T } from "../../../../template/kari";
import { pad2, splitTitle } from "../../../../template/shared";

/* ---------- 文字の型 ---------- */

/** 日本語の見出しを文節で折り返す（lang="ja" 前提。未対応のブラウザは通常の折り返し） */
export const PHRASE = "[word-break:auto-phrase]";
/** 本文（16px・行間1.8） */
export const BODY = "text-base leading-[1.8] text-text-secondary";
export const H2 = "[word-break:auto-phrase] font-heading text-[26px] font-bold leading-[1.45] tracking-[-0.04em] text-text-primary md:text-[32px]";
export const H3 = "[word-break:auto-phrase] font-heading text-[20px] font-bold leading-[1.5] tracking-[-0.02em] text-text-primary md:text-[22px]";
export const H4 = "[word-break:auto-phrase] font-heading text-base font-bold leading-[1.6] text-text-primary";
/** セクション（上に細い線、余白 --s-16 相当） */
export const SECTION = "scroll-mt-20 border-t border-border-light py-14 md:py-16";

/** フォーカスの輪（キーボード操作） */
export const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary";

/**
 * 押せるカード: 浮き上がり（transform）＋あらかじめ置いた影（::before の opacity）だけを動かす。
 * 角丸は呼び出し側で rounded-[…] を渡す（::before は inherit）。
 */
export const LIFT_CARD = cn(
  "group relative border border-border-light bg-surface shadow-[var(--shadow-xs)]",
  "transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[var(--shadow-md)] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100",
  FOCUS
);

/** 押せないカード（同じ角丸・線の仲間） */
export const STATIC_CARD = "border border-border-light bg-surface";

/** 矢印（ホバーで 2px 右へ） */
export function Arrow({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <ArrowRight
      size={size}
      aria-hidden="true"
      className={cn(
        "shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0",
        className
      )}
    />
  );
}

/** 小さな英字の見出し（ペルソナページの kicker） */
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] uppercase leading-[1.5] tracking-[0.12em] text-text-muted", className)}>
      {children}
    </p>
  );
}

export function SectionHead({
  id,
  kicker,
  title,
  lead,
}: {
  id: string;
  kicker: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
}) {
  return (
    <div className="max-w-[720px]">
      <Kicker>{kicker}</Kicker>
      <h2 id={id} className={cn(H2, "mt-3")}>
        {title}
      </h2>
      {lead ? <div className={cn(BODY, "mt-3")}>{lead}</div> : null}
    </div>
  );
}

/** 段落（文ごとに「仮」タグ） */
export function P({ para, className }: { para: Para; className?: string }) {
  return (
    <p className={cn(BODY, className)}>
      {para.map((f, i) => (
        <T key={i} f={f} />
      ))}
    </p>
  );
}

/** テキストのリンク（矢印つき） */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-[4px] border-b border-border-default pb-0.5 text-sm font-bold text-text-primary hover:border-text-primary",
        FOCUS,
        className
      )}
    >
      {children}
      <Arrow size={14} />
    </Link>
  );
}

/* ---------- スキルのタグ（形で区別） ---------- */

export function SkillTagBadge({ tag, className }: { tag: SkillTag; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full px-2 py-px font-noto-sans-jp text-xs font-bold leading-[1.6]",
        tag === "cut" && "border border-text-primary text-text-primary",
        tag === "edge" && "border border-text-primary bg-text-primary text-text-inverse",
        tag === "potential" && "border border-dashed border-text-secondary text-text-secondary",
        className
      )}
    >
      {SKILL_TAG_LABEL[tag]}
    </span>
  );
}

/** タグの見方（凡例） */
export function SkillTagLegend({ className }: { className?: string }) {
  const items: { tag: SkillTag; note: string }[] = [
    { tag: "cut", note: "無いと書類で落ちる" },
    { tag: "edge", note: "選考の決め手になる" },
    { tag: "potential", note: "伸びしろとして見られる" },
  ];
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}>
      {items.map((it) => (
        <li key={it.tag} className="flex items-center gap-2 text-sm text-text-secondary">
          <SkillTagBadge tag={it.tag} />
          {it.note}
        </li>
      ))}
    </ul>
  );
}

/* ---------- アイコン ---------- */

const ICONS: Record<V6Icon, typeof Figma> = {
  figma: Figma,
  layout: Layer,
  hierarchy: Hierarchy,
  people: Profile2User,
  message: MessageText,
  magic: Magicpen,
  repeat: Repeat,
  brush: Brush2,
  routing: Routing,
};

/** アイコンのタイル（ペルソナページの briefCard の作り） */
export function IconTile({ icon, size = "md" }: { icon: V6Icon; size?: "sm" | "md" | "lg" }) {
  const Icon = ICONS[icon];
  const box = size === "lg" ? "size-14 rounded-[16px]" : size === "md" ? "size-11 rounded-[12px]" : "size-9 rounded-[10px]";
  const px = size === "lg" ? 28 : size === "md" ? 22 : 18;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden text-text-primary",
        "bg-[var(--persona-hero-surface)] bg-[image:url('/images/lesson-persona-ui/hero-gradient.webp')] bg-cover bg-center",
        box
      )}
    >
      <span className="absolute inset-0 bg-surface/60" />
      <Icon size={px} color="currentColor" variant="Linear" className="relative" />
    </span>
  );
}

/* ---------- アウトプットの数字 ---------- */

export function OutputFigure({ step, size = "md" }: { step: V6Step; size?: "md" | "lg" }) {
  const o = step.output;
  return (
    <div className="flex items-end gap-4">
      <p className="flex shrink-0 items-baseline gap-1 text-text-primary">
        <span
          className={cn(
            "font-latin font-bold leading-none tracking-[-0.04em] tabular-nums",
            size === "lg" ? "text-[64px] md:text-[80px]" : "text-[48px] md:text-[56px]"
          )}
        >
          {o.amount}
        </span>
        <span className="font-heading text-lg font-bold">{o.unit}</span>
      </p>
      <div className="min-w-0 pb-1">
        <p className="font-heading text-base font-bold leading-[1.5] text-text-primary">
          <T f={o.label} />
        </p>
        <p className="text-sm leading-[1.6] text-text-secondary">
          <T f={o.note} />
        </p>
      </div>
    </div>
  );
}

/* ---------- 大きなコースカード ---------- */

export function courseSlugOf(ref: V6CourseRef): string | null {
  return ref.type === "course" ? ref.slug : null;
}

/**
 * 大きなコースカード。ページの他のカードと同じ角丸・線の仲間にし、売り文句は置かない（定石5）。
 * ボタンは最後に1つだけ（persona-gradient は使わない＝1画面に1つの主ボタンを守る）。
 */
export function CourseCard({
  course,
  lessons,
  headingLevel = "p",
}: {
  course: V6CourseRef;
  lessons: LessonMap;
  /** カードのタイトルのタグ（見出しの階層は呼び出し側で決める） */
  headingLevel?: "p" | "h3" | "h4" | "h5";
}) {
  const Title = headingLevel;
  if (course.type === "planned") {
    return (
      <div className="flex flex-col gap-3 rounded-[20px] border border-dashed border-border-default p-5 md:flex-row md:items-center md:gap-6 md:p-6">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-muted-strong px-2 py-0.5 text-xs font-bold text-text-muted">準備中</span>
          <Title className="mt-2 font-heading text-[18px] font-bold leading-[1.5] text-text-primary">{course.title}</Title>
          <p className={cn(BODY, "mt-1")}>
            <T f={course.summary} />
          </p>
        </div>
      </div>
    );
  }

  const data = getCourse(course.slug);
  if (!data) return null;
  const { main } = splitTitle(data.title.text);
  const covers = pickCovers(data, lessons);
  const lessonCount = data.steps.flatMap((st) => st.items).length;
  const href = `/dev/course-pages/v2/${course.slug}`;

  return (
    <div className={cn("grid gap-5 rounded-[32px] p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8 md:p-4", STATIC_CARD)}>
      <CourseEyecatch
        covers={covers}
        label={data.shortTitle.text}
        meta={`${lessonCount} LESSONS`}
        sizes="(min-width: 768px) 140px, 25vw"
        className="rounded-[24px]"
      />
      <div className="min-w-0 px-2 pb-3 md:px-0 md:pb-0 md:pr-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Course</p>
        <Title className="mt-1.5 font-heading text-[20px] font-bold leading-[1.45] tracking-[-0.02em] text-text-primary md:text-[22px]">
          {main}
        </Title>
        <p className={cn(BODY, "mt-2")}>
          <T f={data.change} />
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
          <div className="flex gap-1.5">
            <dt className="text-text-muted">期間</dt>
            <dd className="font-bold text-text-primary">
              <T f={data.period} />
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-text-muted">レッスン</dt>
            <dd className="font-bold text-text-primary">{lessonCount}本</dd>
          </div>
        </dl>
        <Button asChild variant="outline-ghost" size="lg" className={cn("group mt-5 rounded-[14px]", FOCUS)}>
          <Link href={href}>
            コースを始める
            <Arrow size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------- パンくず ---------- */

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="パンくずリスト">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight size={12} aria-hidden="true" className="shrink-0" /> : null}
            {it.href ? (
              <Link href={it.href} className={cn("rounded-[4px] hover:text-text-primary", FOCUS)}>
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-secondary">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { pad2 };
