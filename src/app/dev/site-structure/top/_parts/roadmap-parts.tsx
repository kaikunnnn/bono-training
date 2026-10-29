/**
 * #267 ロードマップのハブと形のページ（267-Q 2章・S4）の部品
 *
 * - F: roadmaps.ts の文言（Field）を出す。推測（kari）なら常に「仮」を付ける（ハブの決まり。KariProvider の切り替えは使わない）
 * - RoadmapCard: 名前（h3）・誰向けの1行・期間・区切りの数・ミニの道のり（点と区切りの名前）・バッジ。カード全体がリンク
 * - MiniPathList: 縦の小さな道のり（コース＝塗りの点／準備中＝点線の点／コースの外＝輪）
 * 色はトークンだけ。オレンジは使わない。
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Briefcase, Brush2, Personalcard } from "iconsax-react";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";
import { cn } from "@/lib/utils";
import type { Roadmap } from "../../../course-pages/data/roadmaps";
import type { Field } from "../../../course-pages/data/types";
import { Kari } from "../../_parts/shared";
import { pathDots, ROADMAP_BADGES, type PathDot, type RoadmapGroupNo } from "../_data/roadmap-hub";
import { FOCUS, PHRASE } from "./hub-parts";

export function F({ f }: { f: Field }) {
  return (
    <>
      {f.text}
      {f.kari ? <Kari /> : null}
    </>
  );
}

const ICON = { size: 26, color: "currentColor", variant: "Outline" as const };
/** 入口ごとのアイコン（トップの入口と同じ） */
export const GROUP_ICON: Record<RoadmapGroupNo, ReactNode> = {
  "01": <Personalcard {...ICON} />,
  "02": <Brush2 {...ICON} />,
  "03": <Briefcase {...ICON} />,
};

export function RoadmapMark({ slug, group, className }: { slug: string; group: RoadmapGroupNo; className?: string }) {
  const badge = ROADMAP_BADGES[slug];
  if (badge) {
    return (
      <span className={cn("relative block size-14 shrink-0 overflow-hidden rounded-[14px] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.06]", className)}>
        <Image src={badge} alt="" fill sizes="56px" unoptimized className="object-cover" />
      </span>
    );
  }
  return (
    <span
      className={cn("flex size-14 shrink-0 items-center justify-center rounded-[14px] border-[0.5px] border-black/10 text-text-primary", className)}
      style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
      aria-hidden="true"
    >
      {GROUP_ICON[group]}
    </span>
  );
}

function Dot({ kind }: { kind: PathDot["kind"] }) {
  return (
    <span
      className={cn(
        "relative z-[1] mt-[5px] size-2.5 shrink-0 rounded-full",
        kind === "course" && "bg-text-primary",
        kind === "planned" && "border border-dashed border-text-muted bg-surface",
        kind === "outside" && "border-2 border-text-primary bg-surface"
      )}
      aria-hidden="true"
    />
  );
}

/** 縦の小さな道のり（区切りの名前つき） */
export function MiniPathList({ dots, className }: { dots: PathDot[]; className?: string }) {
  return (
    <ol className={cn("relative flex flex-col gap-1.5", className)}>
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[4.5px] w-px bg-border-default" />
      {dots.map((d, i) => (
        <li key={`${d.label}-${i}`} className="flex items-start gap-3">
          <Dot kind={d.kind} />
          <span
            className={cn(
              "min-w-0 font-noto-sans-jp text-[13px] leading-[1.6]",
              d.kind === "planned" ? "text-text-muted" : "text-text-primary"
            )}
          >
            {d.label}
            {d.kind === "planned" ? <span className="ml-1.5 text-[11px] text-text-muted">準備中</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function RoadmapCard({
  roadmap,
  group,
  href,
  featured,
}: {
  roadmap: Roadmap;
  group: RoadmapGroupNo;
  href: string;
  /** 作り込み済み（v6）のロードマップ */
  featured?: boolean;
}) {
  const dots = pathDots(roadmap);
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-5 rounded-[20px] border bg-surface p-6 shadow-[var(--shadow-xs)]",
        "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] motion-reduce:hover:translate-y-0",
        featured ? "border-text-primary/30 hover:border-text-primary/50" : "border-border-light hover:border-border-default",
        FOCUS
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <RoadmapMark slug={roadmap.slug} group={group} />
        <dl className="flex flex-col items-end gap-0.5 text-right font-noto-sans-jp">
          <dt className="sr-only">期間</dt>
          <dd className="text-sm font-bold text-text-primary">
            <F f={roadmap.period} />
          </dd>
          <dt className="sr-only">区切りの数</dt>
          <dd className="text-xs text-text-muted">{dots.length}つの区切り</dd>
        </dl>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className={cn("font-heading text-xl font-bold leading-[1.45] text-text-primary", PHRASE)}>{roadmap.name}</h3>
        <p className="line-clamp-2 font-noto-sans-jp text-[13px] leading-[1.7] text-text-secondary">
          <F f={roadmap.audience} />
        </p>
      </div>
      <div className="rounded-[14px] bg-muted-custom/60 px-4 py-3.5">
        <p className="mb-2 font-noto-sans-jp text-[11px] font-bold tracking-[0.08em] text-text-muted">道のり</p>
        <MiniPathList dots={dots} />
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 font-noto-sans-jp text-sm font-bold text-text-primary">
        {featured ? "ステップを見る" : "道のりを見る"}
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
