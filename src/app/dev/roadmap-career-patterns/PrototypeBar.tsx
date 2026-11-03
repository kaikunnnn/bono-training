/**
 * 試作の切り替えバー（#282）
 *
 * サイトのUIに見えないよう、黒灰＋等幅フォント＋点線で「試作の道具」と分かる見た目にする。
 * 開発用の道具なので共通 Button ではなく、/dev の他の比較ページと同じく素の Link で作る。
 * 見出しタグは使わない（h1 はヒーローの1つだけ）。
 */

import Link from "next/link";
import { HYPOTHESES, PATTERNS, type PatternKey } from "./patterns";

export default function PrototypeBar({ current }: { current: PatternKey }) {
  const def = PATTERNS.find((p) => p.key === current) ?? PATTERNS[0];

  return (
    <div className="border-b-2 border-dashed border-zinc-500 bg-zinc-900 font-mono text-zinc-100">
      <div className="flex items-center gap-2 px-3 pt-2">
        <span className="shrink-0 rounded-[4px] bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-900">
          試作 #282
        </span>
        <span className="truncate text-[11px] text-zinc-400">/dev/roadmap-career-patterns（試作・ローカルのみ）</span>
      </div>

      {/* パターン切り替え（スマホは横スクロール） */}
      <nav aria-label="試作パターンの切り替え" className="overflow-x-auto px-3 py-2">
        <ul className="flex w-max gap-1.5">
          {PATTERNS.map((p) => {
            const active = p.key === current;
            return (
              <li key={p.key}>
                <Link
                  href={{ pathname: "/dev/roadmap-career-patterns", query: { p: p.key } }}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] bg-zinc-100 px-2.5 text-[12px] font-bold text-zinc-900"
                      : "inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] border border-zinc-600 px-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 選択中のパターン: 何を変えたか＋効く仮説 */}
      <div className="flex flex-col gap-1.5 px-3 pb-2.5">
        <p className="text-[12px] leading-[18px] text-zinc-200">
          <span className="text-zinc-400">{def.label}：</span>
          {def.change}
        </p>
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
