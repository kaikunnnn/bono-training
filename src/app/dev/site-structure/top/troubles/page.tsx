/**
 * #267 悩みの一覧（267-Q 2章・S1）
 *
 * 親子は 267-O 1章: トップ > 悩みの一覧 > 悩みの項目。項目の親はこのページだけ。
 * 中身は _data/hierarchy.ts（267-P 7章の名前）から作る。文言は二重に持たない。
 * - 頭: パンくず・h1・1行の説明・データから数えた数・ここで開けるレッスンの表紙
 * - 入口で絞り込み（?entry=01〜03。リンクのチップなのでサーバーだけで動く）＋4つの分け方の目次
 * - 4つの分け方ごとにカード → 人に聞く出口 → 次に整えたいこと
 * 未ログイン／会員は ?state=member（右下の確認用の切り替え）。本番は proxy の /dev 遮断で 404。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { fetchLessons } from "../../../course-pages/data/sanity-lessons";
import { Kari } from "../../_parts/shared";
import {
  ENTRIES,
  TROUBLE_GROUPS,
  TROUBLES_BASE,
  thumbSlugs,
  troubleCounts,
  troubleHref,
  troubles,
  type EntryNo,
} from "../_data/hierarchy";
import { DevStateToggle } from "../_parts/DevStateToggle";
import {
  AskPeople,
  FOCUS,
  HubHeader,
  ItemCard,
  NextSteps,
  PAGE,
  PHRASE,
  TocChips,
} from "../_parts/hub-parts";
import { CAREER_BASE, TOP_BASE, withState } from "../_parts/top-parts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "悩みの一覧｜UIデザインのつまずきと確かめ方（#267 試作）",
  robots: { index: false, follow: false },
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseEntry(v: string | undefined): EntryNo | null {
  return v === "01" || v === "02" || v === "03" ? v : null;
}

export default async function TroublesHubPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; entry?: string }>;
}) {
  const { state, entry: rawEntry } = await searchParams;
  const member = state === "member";
  const entry = parseEntry(rawEntry);

  const lessons = await fetchLessons(thumbSlugs(troubles));
  const counts = troubleCounts();
  // 一覧の番号は、絞り込んでも変えない（全体の並びの番号）
  const numbered = troubles.map((item, i) => ({ item, no: pad2(i + 1) }));
  const shown = entry ? numbered.filter(({ item }) => item.entries?.includes(entry)) : numbered;
  const groups = TROUBLE_GROUPS.map((g) => ({ ...g, rows: shown.filter(({ item }) => item.group === g.id) })).filter(
    (g) => g.rows.length > 0
  );

  const filterHref = (e: EntryNo | null) => withState(e ? `${TROUBLES_BASE}?entry=${e}` : TROUBLES_BASE, member);
  const filters: { value: EntryNo | null; label: string; no?: string }[] = [
    { value: null, label: "すべて" },
    ...ENTRIES.map((e) => ({ value: e.no, label: e.label, no: e.no })),
  ];

  return (
    <div className="pb-24">
      <HubHeader
        crumbs={[{ label: "トップ", href: withState(TOP_BASE, member) }, { label: "悩みの一覧" }]}
        eyebrow="TROUBLES / 悩みから探す"
        title="悩みの一覧"
        intro={
          <>
            作っていて手が止まったら、近い悩みを開いてください。確かめる順番と、練習できるレッスンをまとめました。
            <Kari />
          </>
        }
        counts={[
          { n: counts.troubles, label: "悩み" },
          { n: counts.lessons, label: "レッスン" },
          ...(member ? [] : [{ n: counts.free, label: "無料で始められる" }]),
        ]}
        covers={thumbSlugs(troubles).map((s) => lessons[s] ?? null)}
        coversCaption="この一覧から開けるレッスンの一部"
      />

      <div className={PAGE}>
        {/* 入口で絞り込み＋4つの分け方の目次 */}
        <div className="flex flex-col gap-5 border-y border-border-light py-6">
          <nav aria-label="入口で絞り込む">
            <p className="mb-3 font-noto-sans-jp text-xs font-bold text-text-muted">あなたに近いのは</p>
            <ul className="flex flex-wrap gap-2">
              {filters.map((f) => {
                const active = f.value === entry;
                return (
                  <li key={f.label}>
                    <Link
                      href={filterHref(f.value)}
                      scroll={false}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 font-noto-sans-jp text-sm font-bold transition-colors",
                        active
                          ? "border-cta-primary-bg bg-cta-primary-bg text-text-inverse"
                          : "border-border-light bg-surface text-text-primary hover:border-border-default hover:bg-hover",
                        FOCUS
                      )}
                    >
                      {f.no ? (
                        <span className={cn("font-latin text-[11px] tracking-[0.12em]", active ? "text-text-inverse/70" : "text-text-muted")}>
                          {f.no}
                        </span>
                      ) : null}
                      {f.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <TocChips
            label="悩みの分け方"
            items={groups.map((g) => ({ href: `#group-${g.id}`, label: g.label, count: g.rows.length }))}
          />
        </div>

        {/* 4つの分け方ごとのカード */}
        <div className="mt-4 flex flex-col">
          {groups.map((g) => (
            <section key={g.id} id={`group-${g.id}`} aria-labelledby={`group-${g.id}-title`} className="scroll-mt-24 pt-14 lg:pt-16">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                <h2 id={`group-${g.id}-title`} className={cn("font-heading text-[26px] font-bold leading-[1.4] text-text-primary lg:text-[32px]", PHRASE)}>
                  {g.label}
                </h2>
                <p className="font-noto-sans-jp text-sm text-text-muted">
                  {g.lead}
                  <Kari />
                </p>
              </div>
              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {g.rows.map(({ item, no }) => (
                  <li key={item.id}>
                    <ItemCard
                      item={item}
                      no={no}
                      href={withState(troubleHref(item.id), member)}
                      lesson={item.thumb ? lessons[item.thumb] : null}
                      member={member}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-16 border-t border-border-light pt-14 lg:mt-24 lg:gap-20">
          <AskPeople
            title="当てはまる悩みが無いときは"
            lead={
              <>
                どの項目にも近くないときは、そのまま人に聞いてください。言葉にならない悩みでも大丈夫です。
                <Kari />
              </>
            }
          />
          <NextSteps
            lead={
              <>
                悩みを1つ片付けたら、道のりと学び方も見ておきましょう。
                <Kari />
              </>
            }
            items={[
              {
                no: "01",
                label: "UIUXデザイナーへの転職を進める",
                href: withState(CAREER_BASE, member),
                reason: "悩みが道のりのどこにあるかが分かる",
              },
              { label: "コースで順番に身につける", href: "/dev/course-pages", reason: "悩みの答えを、最初から順に学べる" },
              { label: "勉強法・キャリア", href: "/guide", reason: "続け方や、転職の準備も知っておく" },
              { label: "新しいトップへ戻る", href: withState(TOP_BASE, member), reason: "ほかの入口から探し直す" },
            ]}
          />
        </div>
      </div>

      <DevStateToggle base={entry ? `${TROUBLES_BASE}?entry=${entry}` : TROUBLES_BASE} member={member} />
    </div>
  );
}
