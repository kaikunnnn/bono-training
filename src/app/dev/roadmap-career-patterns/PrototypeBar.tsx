/**
 * 試作の切り替えバー（#282）
 *
 * サイトのUIに見えないよう、黒灰＋等幅フォント＋点線で「試作の道具」と分かる見た目にする。
 * 開発用の道具なので共通 Button ではなく、/dev の他の比較ページと同じく素の Link で作る。
 * 見出しタグは使わない（h1 はヒーローの1つだけ）。
 */

import Link from "next/link";
import { HYPOTHESES, PATTERNS, type GuideView, type PatternKey } from "./patterns";

const PATHNAME = "/dev/roadmap-career-patterns";
const ACTIVE_CHIP =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] bg-zinc-100 px-2.5 text-[12px] font-bold text-zinc-900";
const CHIP =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] border border-zinc-600 px-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800";

/** 見え方・AIのステップの切り替え（現在の URL の値を引き継ぐ） */
function ToggleGroup({
  label,
  options,
}: {
  label: string;
  options: { key: string; text: string; active: boolean; query: Record<string, string> }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-[11px] text-zinc-400">{label}</span>
      <ul className="flex gap-1.5">
        {options.map((o) => (
          <li key={o.key}>
            <Link
              href={{ pathname: PATHNAME, query: o.query }}
              aria-current={o.active ? "true" : undefined}
              className={o.active ? ACTIVE_CHIP : CHIP}
            >
              {o.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PrototypeBar({
  current,
  view,
  aiOn,
  aiParam,
}: {
  current: PatternKey;
  view: GuideView;
  aiOn: boolean;
  /** URL に明示された ai の値（パターンを切り替えても引き継ぐ） */
  aiParam?: string;
}) {
  const def = PATTERNS.find((p) => p.key === current) ?? PATTERNS[0];
  const isGuide = current === "guide";
  const baseQuery: Record<string, string> = { p: current, ...(isGuide ? { view } : {}) };

  return (
    <div className="border-b-2 border-dashed border-zinc-500 bg-zinc-900 font-mono text-zinc-100">
      <div className="flex items-center gap-2 px-3 pt-2">
        <span className="shrink-0 rounded-[4px] bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-900">
          試作 #282・#295
        </span>
        <span className="truncate text-[11px] text-zinc-400">/dev/roadmap-career-patterns（試作・本番には出ない）</span>
      </div>

      {/* パターン切り替え（スマホは横スクロール） */}
      <nav aria-label="試作パターンの切り替え" className="overflow-x-auto px-3 py-2">
        <ul className="flex w-max gap-1.5">
          {PATTERNS.map((p) => {
            const active = p.key === current;
            return (
              <li key={p.key}>
                <Link
                  // 現状は本番と同じ並びに戻すので ai を引き継がない
                  href={{
                    pathname: PATHNAME,
                    query: {
                      p: p.key,
                      ...(p.key === "guide" ? { view } : {}),
                      ...(aiParam && p.key !== "now" ? { ai: aiParam } : {}),
                    },
                  }}
                  aria-current={active ? "page" : undefined}
                  className={active ? ACTIVE_CHIP : CHIP}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 見え方（guide のみ）・AIのステップ */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-3 pb-2">
        {isGuide && (
          <ToggleGroup
            label="見え方"
            options={[
              { key: "guest", text: "未ログイン", active: view === "guest", query: { ...baseQuery, view: "guest", ...(aiParam ? { ai: aiParam } : {}) } },
              { key: "member", text: "ログイン中", active: view === "member", query: { ...baseQuery, view: "member", ...(aiParam ? { ai: aiParam } : {}) } },
            ]}
          />
        )}
        <ToggleGroup
          label="AIのステップ"
          options={[
            { key: "on", text: "あり", active: aiOn, query: { ...baseQuery, ai: "1" } },
            { key: "off", text: "なし", active: !aiOn, query: { ...baseQuery, ai: "0" } },
          ]}
        />
      </div>

      {/* 選択中のパターン: 何を変えたか＋効く仮説（#295 は案の番号と狙い） */}
      <div className="flex flex-col gap-1.5 px-3 pb-2.5">
        <p className="text-[12px] leading-[18px] text-zinc-200">
          <span className="text-zinc-400">
            {def.label}
            {def.proposal ? `（${def.proposal}）` : ""}：
          </span>
          {def.change}
        </p>
        {def.aim && (
          <p className="text-[12px] leading-[18px] text-zinc-300">
            <span className="text-zinc-400">狙い：</span>
            {def.aim}
          </p>
        )}
        {def.hypotheses.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {def.hypotheses.map((h) => (
              <li
                key={h}
                className="rounded-[4px] border border-zinc-600 px-1.5 py-px text-[10px] leading-[16px] text-zinc-300"
              >
                {h} {HYPOTHESES[h]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
