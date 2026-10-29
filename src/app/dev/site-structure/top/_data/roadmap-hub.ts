/**
 * #267 ロードマップのハブ（267-Q 2章・S4）のデータ
 *
 * 中身の正は roadmaps.ts（8本。名前は 267-P 1章）。ここは「どの入口（01〜03）に並べるか」と行き先だけを持つ。文言は二重に持たない。
 * - 未経験からUI/UXデザイナーへ（career-change）は v6 で作り込み済みなので、行き先は 01 の入口ページ（/top/career）
 * - ほかの7本は /top/roadmap/[slug] の形のページ
 * バッジ画像は /public/images/roadmap/badges のうち、中身が合うものだけ使う（合わないものはアイコン）。
 */

import { courses } from "../../../course-pages/data";
import { getRoadmap, stopLabel, type Roadmap } from "../../../course-pages/data/roadmaps";
import { v6Steps } from "../../../course-pages/data/roadmap-career-change-v6";
import { CAREER_BASE, ROADMAP_HUB_BASE } from "../_parts/top-parts";

export type RoadmapGroupNo = "01" | "02" | "03";

export interface RoadmapGroup {
  no: RoadmapGroupNo;
  /** 入口の名前（トップの 01〜03 と同じ） */
  label: string;
  /** どんな人の入口か（1行・仮） */
  lead: string;
  slugs: string[];
}

export const ROADMAP_GROUPS: RoadmapGroup[] = [
  {
    no: "01",
    label: "UIUXデザイナーへの転職を進める",
    lead: "デザイナーとして働くことを目指す人の道のり",
    slugs: ["career-change", "web-graphic-to-ui", "strong-portfolio"],
  },
  {
    no: "02",
    label: "UIデザインのスキルを伸ばす",
    lead: "転職するかに関わらず、画面をつくる力を伸ばしたい人の道のり",
    slugs: ["ui-basics", "work-screens", "ai-design"],
  },
  {
    no: "03",
    label: "実務の悩みを解決する",
    lead: "仕事でデザインしていて、次の壁を越えたい人の道のり",
    slugs: ["user-centered", "proposal"],
  },
];

/** 中身が合うバッジだけ（Path to UI/UX Designer・UIビジュアル・UX） */
export const ROADMAP_BADGES: Record<string, string> = {
  "career-change": "/images/roadmap/badges/career.webp",
  "ui-basics": "/images/roadmap/badges/uivisual.webp",
  "user-centered": "/images/roadmap/badges/ux.webp",
};

/** v6 で作り込み済みのロードマップ（行き先は 01 の入口ページ） */
export const V6_SLUG = "career-change";

export function roadmapHubHref(slug: string) {
  return slug === V6_SLUG ? CAREER_BASE : `${ROADMAP_HUB_BASE}/${slug}`;
}

export function groupOf(slug: string): RoadmapGroup | null {
  return ROADMAP_GROUPS.find((g) => g.slugs.includes(slug)) ?? null;
}

/** カードのミニの道のりに出す点（career-change は v6 のステップ。ほかは roadmaps.ts の区切り） */
export interface PathDot {
  label: string;
  kind: "course" | "planned" | "outside";
}

export function pathDots(r: Roadmap): PathDot[] {
  if (r.slug === V6_SLUG) return v6Steps.map((st) => ({ label: st.short, kind: st.course.type === "course" ? "course" : "outside" }));
  return r.stops.map((st) => ({
    // コースは正式な短い名前（例: はじめてのUIデザイン入門）。無ければ roadmaps.ts の呼び名
    label: st.type === "course" ? (courses[st.slug]?.shortTitle.text ?? stopLabel(st)) : st.title,
    kind: st.type === "course" ? "course" : st.type === "planned-course" ? "planned" : "outside",
  }));
}

export function hubRoadmaps(group: RoadmapGroup): Roadmap[] {
  return group.slugs.map((slug) => {
    const r = getRoadmap(slug);
    if (!r) throw new Error(`[roadmap-hub] ロードマップが見つからない: ${slug}`);
    return r;
  });
}

// 読み込み時の確かめ: 267-P 1章の8本がそろっているか
const ALL = ROADMAP_GROUPS.flatMap((g) => g.slugs);
if (ALL.length !== 8 || new Set(ALL).size !== 8) throw new Error("[roadmap-hub] ロードマップの数が 267-P 1章とずれている");
ALL.forEach((slug) => {
  if (!getRoadmap(slug)) throw new Error(`[roadmap-hub] roadmaps.ts に無い: ${slug}`);
});
