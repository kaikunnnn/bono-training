/**
 * /dev/course-pages/prototyping/roadmap — ロードマッププロトのハブ（#243）
 * オーナーが上から順に確認できるよう、前提→置き場所→実物→入口→中身 の順に並べる。
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

/** 確認する順番。上から順に見れば、前提 → 置き場所 → 実物 → 入口 → 中身 の流れになる */
const STEPS: { kicker: string; title: string; point: string; links: { label: string; href: string }[] }[] = [
  {
    kicker: "Step 1 · 前提",
    title: "コースとロードマップの違い",
    point: "見るポイント：2つの役割の分け方に違和感がないか。進めるのはコースだけ、ロードマップは選ばない",
    links: [
      { label: "違いのページ", href: `${ROADMAP_BASE}/vs-course` },
      { label: "コースを進める仕組み（イメージ）", href: `${ROADMAP_BASE}/flow` },
    ],
  },
  {
    kicker: "Step 2 · 置き場所",
    title: "サイト内の見せ方（注釈つきモック）",
    point: "見るポイント：どこで・誰に・何を見せるか。サイドナビ、トップ、マイページ、修了画面の4か所",
    links: [{ label: "4つのモック", href: `${ROADMAP_BASE}/placement` }],
  },
  {
    kicker: "Step 3 · 実物",
    title: "実物のページに当てはめる",
    point: "見るポイント：本番に入れたときの見た目。サイドナビは新しい並びになっていて、クリックで行き来できる",
    links: [
      { label: "課金ユーザーのトップ（ホーム）", href: `${ROADMAP_BASE}/applied/home` },
      { label: "未ログインのトップ", href: `${ROADMAP_BASE}/applied/top` },
      { label: "マイページ", href: `${ROADMAP_BASE}/applied/mypage` },
      { label: "コース修了の画面", href: `${ROADMAP_BASE}/applied/course-complete` },
    ],
  },
  {
    kicker: "Step 4 · 入口",
    title: "行き先を選ぶ",
    point: "見るポイント：迷っている人が3問で1本に決められるか",
    links: [{ label: "行き先を選ぶページ", href: `${ROADMAP_BASE}/list` }],
  },
];

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
          コース＝中身、ロードマップ＝地図（#242）。ロードマップにはレッスンを並べず、コースとコースの外でやることを並べます。上から順に見ていくと、前提 → 置き場所 → 実物 → 入口 → 中身 の流れで確認できます。
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {STEPS.map((step) => (
            <section key={step.kicker} aria-label={step.title} className="rounded-[24px] border border-border-light p-5 md:p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">{step.kicker}</p>
              <h2 className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">{step.title}</h2>
              <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">{step.point}</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {step.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-center gap-4 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
                    >
                      <p className="min-w-0 flex-1 font-heading text-[15px] font-bold leading-[1.5]">{l.label}</p>
                      <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section aria-labelledby="rm-hub-detail" className="rounded-[24px] border border-border-light p-5 md:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Step 5 · 中身</p>
            <h2 id="rm-hub-detail" className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">
              ロードマップの詳細（6本）
            </h2>
            <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">
              見るポイント：行き先・道のり・コースの外でやること・進め方がわかるか。まずは「未経験から転職」から。「進捗あり」は会員の見え方（いまここ）。
            </p>
            <Link
              href={`${ROADMAP_BASE}/career-change-v5`}
              className="group mt-5 flex min-w-0 items-center gap-4 rounded-[16px] border-2 border-text-primary bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-heading text-[15px] font-bold leading-[1.5]">
                  未経験から転職（v5・採用側の根拠と入口の現実）
                  <span className="rounded-full bg-text-primary px-2 py-0.5 font-noto-sans-jp text-[10px] text-text-inverse">NEW</span>
                </p>
                <p className="text-xs text-text-muted">日本の求人票と採用側の記事を根拠に、企業が何を・なぜ見ているか、AIで何が変わったかを足した形。まずはここから確認</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={`${ROADMAP_BASE}/career-change-v4`}
              className="group mt-2.5 flex min-w-0 items-center gap-4 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[15px] font-bold leading-[1.5]">未経験から転職（v4・記事ベース）</p>
                <p className="text-xs text-text-muted">BONOの記事だけを材料に、何を・どの順で・なぜ を書いた形</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href={`${ROADMAP_BASE}/career-change-v3`}
                className="group flex min-w-0 flex-1 items-center gap-4 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[15px] font-bold leading-[1.5]">未経験から転職（v3・区切りごとにポートフォリオが育つ形）</p>
                  <p className="text-xs text-text-muted">見た目と流れの試作</p>
                </div>
                <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={`${ROADMAP_BASE}/career-change-v3?progress=1`}
                className="shrink-0 rounded-full border border-border-light bg-surface px-3 py-1.5 text-[11px] font-bold text-text-secondary hover:border-border-default"
              >
                進捗あり
              </Link>
            </div>
            <p className="mt-5 text-xs font-bold text-text-muted">前の形（6本）</p>
            <ul className="mt-2 flex flex-col gap-2.5">
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
