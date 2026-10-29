/**
 * ロードマップの道のりの区切りのカード（#243 の [slug]/page.tsx から切り出し。#267 の各ロードマップの形のページでも使う）
 *
 * - StopCard: コース（CourseEyecatch つき）／準備中のコース（点線）／コースの外でやること（アイコンつき）
 * - StopReason: なぜこの順番か／次へ進んでよい目安
 * 文言の出し方は renderField で差し替えられる（既定は KariProvider の T）。
 */

import type React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Briefcase, Book1, Flag, MessageText, TickCircle } from "iconsax-react";
import { cn } from "@/lib/utils";
import { getCourse } from "../../data";
import type { OutsideKind, RoadmapStop } from "../../data/roadmaps";
import type { Field, LessonMap } from "../../data/types";
import CourseEyecatch, { pickCovers } from "../../template/CourseEyecatch";
import { T } from "../../template/kari";
import { splitTitle } from "../../template/shared";
import { StopIcon } from "./parts";

type RenderField = (f: Field) => React.ReactNode;
const defaultRender: RenderField = (f) => <T f={f} />;

/** 押せるもの（白） */
export const CLICKABLE =
  "border border-border-light bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]";

export function stopKindLabel(stop: RoadmapStop) {
  if (stop.type === "course") return "コース";
  if (stop.type === "planned-course") return "準備中のコース";
  return "コースの外でやること";
}

export function GuideIcon({ kind, size = 20 }: { kind: OutsideKind; size?: number }) {
  if (kind === "portfolio") return <Book1 size={size} color="currentColor" variant="Linear" />;
  if (kind === "feedback") return <MessageText size={size} color="currentColor" variant="Linear" />;
  return <Briefcase size={size} color="currentColor" variant="Linear" />;
}

/* ---------- 道のりのカード ---------- */

export function CourseStopCard({
  slug,
  lessons,
  note,
  emphasized,
  headingLevel = "h3",
}: {
  slug: string;
  lessons: LessonMap;
  note: React.ReactNode;
  emphasized: boolean;
  headingLevel?: "h3" | "h4";
}) {
  const H = headingLevel;
  const course = getCourse(slug);
  if (!course) return null;
  const { main, sub } = splitTitle(course.title.text);
  return (
    <Link
      href={`/dev/course-pages/v2/${slug}`}
      className={cn(
        "group flex flex-col gap-4 rounded-[20px] p-4 sm:flex-row sm:items-center sm:gap-5 md:p-5",
        CLICKABLE,
        emphasized && "border-text-primary hover:border-text-primary"
      )}
    >
      <div className="hidden w-[156px] shrink-0 sm:block">
        <CourseEyecatch covers={pickCovers(course, lessons)} label="" sizes="44px" className="rounded-[14px]" plannedLabel="近日公開" />
      </div>
      <div className="min-w-0 flex-1">
        <H className="font-heading text-[17px] font-bold leading-[1.5] text-text-primary">{main}</H>
        {sub ? <p className="text-xs font-bold text-text-secondary">{sub}</p> : null}
        <p className="mt-2 text-[13px] leading-[1.8] text-text-secondary">{note}</p>
        <p className="mt-2 flex items-center gap-1 text-xs font-bold text-text-primary">
          コースを見る
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

export function StopCard({
  stop,
  lessons,
  emphasized,
  renderField = defaultRender,
  headingLevel = "h3",
}: {
  stop: RoadmapStop;
  lessons: LessonMap;
  emphasized: boolean;
  /** 文言の出し方（既定は KariProvider の T。#267 の試作は常に「仮」を出す） */
  renderField?: RenderField;
  headingLevel?: "h3" | "h4";
}) {
  const note = renderField(stop.note);
  const H = headingLevel;
  if (stop.type === "course") {
    return <CourseStopCard slug={stop.slug} lessons={lessons} note={note} emphasized={emphasized} headingLevel={headingLevel} />;
  }
  if (stop.type === "planned-course") {
    // 押せないので白にしない。点線＋薄く
    return (
      <div
        className={cn(
          "rounded-[20px] border-2 border-dashed p-4 md:p-5",
          emphasized ? "border-text-primary/40" : "border-border-light"
        )}
      >
        <H className="font-heading text-[17px] font-bold leading-[1.5] text-text-disabled">{stop.title}</H>
        <p className="mt-2 text-[13px] leading-[1.8] text-text-muted">{note}</p>
      </div>
    );
  }
  // コース外のやること: アイコン付きの別の見た目（押せるのでリンク）
  const external = stop.href.startsWith("http");
  return (
    <Link
      href={stop.href}
      target={external ? "_blank" : undefined}
      className={cn(
        "group flex items-start gap-4 rounded-full py-3 pl-3 pr-5 max-sm:rounded-[20px]",
        CLICKABLE,
        emphasized && "border-text-primary hover:border-text-primary"
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--persona-hero-surface)] text-text-primary">
        <StopIcon stop={stop} />
      </span>
      <div className="min-w-0 flex-1 py-0.5">
        <H className="font-heading text-[16px] font-bold leading-[1.5] text-text-primary">{stop.title}</H>
        <p className="mt-0.5 text-[13px] leading-[1.75] text-text-secondary">{note}</p>
      </div>
      <ArrowRight size={18} className="mt-3 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** 区切りの下: なぜこの順番か／次へ進んでよい目安（終えた区切りは印つき） */
export function StopReason({
  stop,
  done,
  renderField = defaultRender,
}: {
  stop: RoadmapStop;
  done: boolean;
  renderField?: RenderField;
}) {
  return (
    <dl className="mt-3 grid gap-2 px-1 text-[13px] leading-[1.75] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3">
      <dt className="text-xs font-bold leading-[1.75] text-text-muted sm:pt-px">なぜこの順番</dt>
      <dd className="-mt-1.5 text-text-secondary sm:mt-0">
        {renderField(stop.whyHere)}
      </dd>
      <dt
        className={cn(
          "flex items-center gap-1 text-xs font-bold leading-[1.75] sm:pt-px",
          done ? "text-text-success" : "text-text-muted"
        )}
      >
        {done ? (
          <TickCircle size={14} color="currentColor" variant="Bold" />
        ) : (
          <Flag size={14} color="currentColor" variant="Linear" />
        )}
        {done ? "目安クリア" : "次へ進む目安"}
      </dt>
      <dd className={cn("-mt-1.5 font-bold sm:mt-0", done ? "text-text-success" : "text-text-primary")}>
        {renderField(stop.checkpoint)}
      </dd>
    </dl>
  );
}

