/**
 * /dev/course-pages/prototyping/roadmap/applied/top — 実物のトップに当てはめる（#243）
 *
 * placement の「02 未ログインのトップ：『目的から選ぶ』入口」を、本番のトップ
 * （NewTopContent をそのまま）に当てはめた見た目。ヒーローの直下に「目的から選ぶ」を差し込み、
 * 未ログインの人が見る状態（入会CTAあり）で描く。本番の各セクションは書き換えない。
 * 推測の文言には「仮」タグ（下の確認用バーで表示）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { NewTopContent } from "@/components/top-next/NewTopContent";
import { MembershipCta } from "@/components/top-next/organisms/HeroSection";
import { Button } from "@/components/ui/button";
import type { Field } from "../../../../data/types";
import { ROADMAP_BASE, roadmaps, type Roadmap } from "../../../../data/roadmaps";
import { KariProvider, T } from "../../../../template/kari";

export const metadata: Metadata = {
  title: "トップに当てはめる（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

const k = (text: string): Field => ({ text, kari: true });

/** 区切りのうちコース（既存＋準備中）の数 */
function courseCount(r: Roadmap) {
  return r.stops.filter((s) => s.type === "course" || s.type === "planned-course").length;
}

/** トップの「目的から選ぶ」セクション（CareerSection と同じ外枠・見出し） */
function PurposeRoadmapSection() {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-t border-black/[0.12] pt-12 pb-8">
        <TopSectionHeading badgeLabel="ロードマップ" heading="目的から選ぶ" className="mb-3" />
        <p className="mb-8 font-noto-sans-jp text-sm leading-[1.8] tracking-[0.7px] text-text-secondary">
          <T f={k("なりたい状態に近いものを1つ選ぶと、最初に進むコースが決まります。")} />
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((r) => (
            <li key={r.slug}>
              <Link
                href={`${ROADMAP_BASE}/${r.slug}`}
                className="group flex h-full flex-col gap-2 rounded-[8px] border border-border-light bg-surface px-5 py-4 transition-colors duration-200 hover:border-border-default"
              >
                <h3 className="flex items-start justify-between gap-3 font-rounded-mplus text-[16px] font-medium leading-[1.6] tracking-[0.22px] text-text-primary">
                  {r.name}
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </h3>
                <p className="line-clamp-2 font-noto-sans-jp text-xs leading-[1.8] text-text-secondary">
                  <T f={r.audience} />
                </p>
                <p className="mt-auto pt-1 font-noto-sans-jp text-xs text-text-muted">
                  目安 <T f={r.period} />・コース{courseCount(r)}つ
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <Button variant="outline-ghost" size="top-cta" className="mt-8" asChild>
          <Link href={`${ROADMAP_BASE}/list`}>
            3つの質問で選ぶ
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default function AppliedTopPage() {
  return (
    <KariProvider>
      {/* 確認用（本番のページには出ない） */}
      <div className="border-b border-dashed border-border-default bg-muted-custom px-6 py-2 font-noto-sans-jp text-xs text-text-secondary lg:px-12">
        <Link href={`${ROADMAP_BASE}/placement`} className="font-bold text-text-primary hover:underline">
          ← サイト内の見せ方
        </Link>
        <span className="ml-3">プロト：未ログインのトップに「目的から選ぶ」を足した見た目（ヒーローの直下）</span>
      </div>
      <NewTopContent membershipCta={<MembershipCta />} afterHero={<PurposeRoadmapSection />} />
    </KariProvider>
  );
}
