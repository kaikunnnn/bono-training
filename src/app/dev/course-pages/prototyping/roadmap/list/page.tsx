/**
 * /dev/course-pages/prototyping/roadmap/list — B 行き先を選ぶ（#243）
 * 迷っている人の無料の入口。3問の診断で1本をおすすめし、6本のカードを並べる。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { roadmaps, stopLabel } from "../../../data/roadmaps";
import { KariProvider } from "../../../template/kari";
import { ROADMAP_BASE, roadmapStats } from "../parts";
import RoadmapChooser, { type RoadmapCardData } from "./RoadmapChooser";

export const metadata: Metadata = {
  title: "行き先を選ぶ（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

export default function RoadmapListPage() {
  const cards: RoadmapCardData[] = roadmaps.map((r) => {
    const s = roadmapStats(r);
    return {
      slug: r.slug,
      name: r.name,
      audience: r.audience,
      outcome: r.outcome,
      period: r.period,
      stops: s.stops,
      planned: s.planned,
      stopLabels: r.stops.map(stopLabel),
    };
  });

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-28 pt-8 md:px-10 md:pt-12">
          <Link href={ROADMAP_BASE} className="text-xs text-text-muted hover:text-text-primary">
            ← ロードマップのプロト
          </Link>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Roadmaps</p>
          <h1 className="mt-2 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
            目的から行き先を選ぶ
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-[1.9] text-text-secondary">
            ロードマップは、なりたい状態までの地図です。どのコースをどの順で進み、コースの外で何をやるかが分かります。
          </p>
          <RoadmapChooser cards={cards} base={ROADMAP_BASE} />
        </div>
      </div>
    </KariProvider>
  );
}
