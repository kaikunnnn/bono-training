/**
 * /dev/course-pages/prototyping/roadmap — ロードマッププロトのハブ（#243）
 * A サイト内の見せ方／B 行き先を選ぶ／C 詳細（6本）へのリンク。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { roadmaps, stopLabel } from "../../data/roadmaps";
import { ROADMAP_BASE, roadmapStats } from "./parts";

export const metadata: Metadata = {
  title: "ロードマップのプロト（#243）",
  robots: { index: false, follow: false },
};

const CARD =
  "group block rounded-[24px] border border-border-light bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] md:p-7";

const APPLIED: { title: string; note: string; href?: string }[] = [
  { title: "未ログインのトップ", note: "ヒーローの直下に「目的から選ぶ」（6本）", href: `${ROADMAP_BASE}/applied/top` },
  { title: "サイドナビ", note: "マイページ（続きから）→ コース → ロードマップ" },
  { title: "マイページ", note: "「続きから」と「いまここ」の小さな地図" },
  { title: "コース修了の画面", note: "修了から、ロードマップの次の1コースへ" },
];

function Head({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">{kicker}</p>
        <h2 className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">{title}</h2>
        <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">{lead}</p>
      </div>
      <ArrowRight size={20} className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}

export default function RoadmapHubPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
      <div className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-10 md:px-10 md:pt-14">
        <Link href="/dev/course-pages/prototyping" className="text-xs text-text-muted hover:text-text-primary">
          ← プロトタイピングに戻る
        </Link>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">#243</p>
        <h1 className="mt-2 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
          ロードマップのプロト
        </h1>
        <p className="mt-3 max-w-[680px] text-[15px] leading-[1.9] text-text-secondary">
          コース＝中身、ロードマップ＝地図（#242）。ロードマップにはレッスンを並べず、コースとコースの外でやることを並べます。サイトのどこで見せるか（A）、行き先の選び方（B）、地図の中身（C）を確かめるためのページです。
        </p>

        <div className="mt-10 flex flex-col gap-6">
          <Link href={`${ROADMAP_BASE}/placement`} className={CARD}>
            <Head
              kicker="A · Placement"
              title="サイト内の見せ方"
              lead="サイドナビの並び、未ログインのトップ、マイページの「いまここ」、コース修了の画面。4つのモックに「どこで・誰に・何を」の注釈つき。"
            />
          </Link>
          <section aria-labelledby="rm-hub-applied" className="rounded-[24px] border border-border-light p-5 md:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">A-2 · Applied</p>
            <h2 id="rm-hub-applied" className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">
              実物のページに当てはめる
            </h2>
            <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">
              A のアイデアを、本番のページにそのまま足した見た目。
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {APPLIED.map((a) => (
                <li key={a.title}>
                  {a.href ? (
                    <Link
                      href={a.href}
                      className="group flex items-center gap-4 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-[15px] font-bold leading-[1.5]">{a.title}</p>
                        <p className="truncate text-xs text-text-muted">{a.note}</p>
                      </div>
                      <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 rounded-[16px] border border-dashed border-border-light px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-[15px] font-bold leading-[1.5] text-text-muted">{a.title}</p>
                        <p className="truncate text-xs text-text-muted">{a.note}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-text-muted">準備中</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
          <Link href={`${ROADMAP_BASE}/list`} className={CARD}>
            <Head
              kicker="B · List"
              title="行き先を選ぶ"
              lead="3問の簡単な診断で1本をおすすめし、6つの行き先をカードで並べる。迷っている人の無料の入口。"
            />
          </Link>
          <section aria-labelledby="rm-hub-detail" className="rounded-[24px] border border-border-light p-5 md:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">C · Detail</p>
            <h2 id="rm-hub-detail" className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">
              ロードマップの詳細（6本）
            </h2>
            <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">
              ?progress=1 で「いまここ」と次の1コース（モック）。
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {roadmaps.map((r) => {
                const s = roadmapStats(r);
                return (
                  <li key={r.slug} className="flex items-center gap-2">
                    <Link
                      href={`${ROADMAP_BASE}/${r.slug}`}
                      className="group flex min-w-0 flex-1 items-center gap-4 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-[15px] font-bold leading-[1.5]">{r.name}</p>
                        <p className="truncate text-xs text-text-muted">
                          {r.stops.map(stopLabel).join(" → ")}（準備中のコース {s.planned}）
                        </p>
                      </div>
                      <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href={`${ROADMAP_BASE}/${r.slug}?progress=1`}
                      className="shrink-0 rounded-full border border-border-light bg-surface px-3 py-1.5 text-[11px] font-bold text-text-secondary hover:border-border-default"
                    >
                      進捗あり
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
