"use client";

/**
 * パターン切替（すべて / A / B / C）と「終了を淡くする」トグル。
 * 各パターンを PC 枠とスマホ 375px 枠に並べて出す（枠の幅で切り替わるようコンテナクエリを使用）。
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PatternDList } from "./pattern-d";
import {
  EventsPageHeader,
  ROW_COMPONENTS,
  type EventListItem,
  type RowPattern,
} from "./rows";

const PATTERNS: { id: RowPattern; title: string; note: string }[] = [
  {
    id: "d",
    title: "D. 日付ブロック＋「募集中」「過去のイベント」の2ブロック（B ベース）",
    note: "B を元に、一覧を「募集中」（開催が近い順）と「過去のイベント」（新しい順）の2つに分けた案。日付ブロックは両ブロック共通の固定幅で、右の区切り線がそろう。年（小）→ 月日（大）→ 曜日（小）の3段。募集中の行は月日をさらに大きくし、開始時刻（20:00〜）と「あと◯日」（当日は「今日」）を出す。状態はブロック名で分かるので「募集中」「終了」バッジは出さない。「終了イベントを淡くする」は過去のブロックだけに効く。",
  },
  {
    id: "a",
    title: "A. 新着型（/updates と同じ行）",
    note: "サムネ（101px / 広い枠で115px）＋「状態バッジ・開催日」＋タイトル＋右の丸い矢印。/updates の ArticleRow と見た目を揃え、カテゴリ欄だけ状態バッジ・開催日に置き換えた。サイト内で一覧の見た目がそろう。「いつ」は小さな文字なので、日付で探すときは目で追う必要がある。",
  },
  {
    id: "b",
    title: "B. 日付ブロック型（カレンダー風）",
    note: "左に日付の塊（上に小さく年、大きく「10/21」＋曜日。概算は「8月」＋「下旬」）→ 区切り線 → 小さめサムネ（72px / 広い枠で96px）→ 状態バッジ＋タイトル。「いつ」が一番先に目に入る。スマホでは矢印を外してタイトルの幅を確保。",
  },
  {
    id: "c",
    title: "C. 大サムネ型（概要つき）",
    note: "サムネ160px（スマホ枠では120px）＋「状態バッジ・開催日」1行＋タイトル（2行まで）＋概要（2行まで）。中身が一番伝わるが、1件の縦幅が大きく、7件でもスクロールが長くなる。矢印は無し（行全体がリンク）。",
  },
];

type PatternFilter = "all" | RowPattern;

export interface PatternDData {
  upcoming: EventListItem[];
  ended: EventListItem[];
  /** 年見出し: あり のときだけ過去ブロックの最後に足すダミー（2025年） */
  dummy2025: EventListItem;
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-text-secondary">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex flex-wrap gap-1 rounded-[12px] bg-muted-custom p-1"
      >
        {options.map((o) => (
          <Button
            key={o.id}
            type="button"
            size="sm"
            variant={value === o.id ? "outline" : "ghost"}
            aria-pressed={value === o.id}
            className="h-8 rounded-[8px] px-3 text-xs"
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Frame({
  label,
  mobile,
  children,
}: {
  label: string;
  mobile?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        mobile ? "max-w-[375px]" : "max-w-[960px]",
      )}
    >
      <span className="text-xs text-text-muted">{label}</span>
      {/* @container: 中の行は画面幅ではなくこの枠の幅でレイアウトが切り替わる */}
      <div className="@container w-full overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-base">
        {children}
      </div>
    </div>
  );
}

interface PreviewOptions {
  fadeEnded: boolean;
  emptyUpcoming: boolean;
  yearHeadings: boolean;
}

function EventsListPreview({
  pattern,
  events,
  dData,
  options,
}: {
  pattern: RowPattern;
  events: EventListItem[];
  dData: PatternDData;
  options: PreviewOptions;
}) {
  let list: ReactNode;
  if (pattern === "d") {
    list = (
      <PatternDList
        upcoming={options.emptyUpcoming ? [] : dData.upcoming}
        // ダミーは 2025年12月 で既存の過去イベントより古いので、新しい順の末尾に足せばよい
        ended={options.yearHeadings ? [...dData.ended, dData.dummy2025] : dData.ended}
        fadeEnded={options.fadeEnded}
        yearHeadings={options.yearHeadings}
      />
    );
  } else {
    const Row = ROW_COMPONENTS[pattern];
    list = (
      <div className="mt-8 flex flex-col">
        {events.map((event) => (
          <Row key={event.slug} event={event} fadeEnded={options.fadeEnded} />
        ))}
      </div>
    );
  }
  return (
    // /updates と同じ余白（px-6 lg:px-12 / py-8）。lg: の代わりに枠幅の @4xl: で切り替える
    <section className="px-6 @4xl:px-12">
      <div className="py-8">
        <EventsPageHeader as="div" />
        {list}
      </div>
    </section>
  );
}

export function EventsListPatterns({
  events,
  dData,
}: {
  events: EventListItem[];
  dData: PatternDData;
}) {
  const [filter, setFilter] = useState<PatternFilter>("d");
  const [fadeEnded, setFadeEnded] = useState(false);
  const [emptyUpcoming, setEmptyUpcoming] = useState(false);
  const [yearHeadings, setYearHeadings] = useState(false);
  const options: PreviewOptions = { fadeEnded, emptyUpcoming, yearHeadings };
  const showDControls = filter === "all" || filter === "d";

  const shown = filter === "all" ? PATTERNS : PATTERNS.filter((p) => p.id === filter);

  return (
    <div className="flex flex-col gap-10">
      <div className="z-10 -mx-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-200 bg-base/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:sticky lg:top-0">
        <SegmentedControl<PatternFilter>
          label="パターン"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "すべて" },
            { id: "d", label: "D 2ブロック" },
            { id: "a", label: "A 新着型" },
            { id: "b", label: "B 日付ブロック" },
            { id: "c", label: "C 大サムネ" },
          ]}
        />
        <SegmentedControl<"off" | "on">
          label="終了イベント"
          value={fadeEnded ? "on" : "off"}
          onChange={(v) => setFadeEnded(v === "on")}
          options={[
            { id: "off", label: "そのまま" },
            { id: "on", label: "淡くする" },
          ]}
        />
        {showDControls && (
          <>
            <SegmentedControl<"real" | "empty">
              label="D 募集中"
              value={emptyUpcoming ? "empty" : "real"}
              onChange={(v) => setEmptyUpcoming(v === "empty")}
              options={[
                { id: "real", label: "実データ" },
                { id: "empty", label: "0件" },
              ]}
            />
            <SegmentedControl<"off" | "on">
              label="D 年見出し"
              value={yearHeadings ? "on" : "off"}
              onChange={(v) => setYearHeadings(v === "on")}
              options={[
                { id: "off", label: "なし" },
                { id: "on", label: "あり（2025年ダミー追加）" },
              ]}
            />
          </>
        )}
      </div>

      {shown.map((p) => (
        <section key={p.id} data-pattern={p.id} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-gray-200 pb-2">
            <h2 className="font-rounded-mplus text-lg font-bold text-text-primary">{p.title}</h2>
            <p className="font-noto-sans-jp text-xs leading-relaxed text-text-primary/60">{p.note}</p>
          </div>
          <div className="flex flex-col items-start gap-6 xl:flex-row">
            <Frame label="PC（最大960px）">
              <EventsListPreview pattern={p.id} events={events} dData={dData} options={options} />
            </Frame>
            <Frame label="スマホ（375px）" mobile>
              <EventsListPreview pattern={p.id} events={events} dData={dData} options={options} />
            </Frame>
          </div>
        </section>
      ))}
    </div>
  );
}
