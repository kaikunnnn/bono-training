import { WS_THEME } from "./theme";

interface WorkshopHeroProps {
  stepsCount: number;
  docsCount: number;
}

/**
 * トップページ ブロック1
 * ラベル+日付の行 → 大見出し → 説明 → スタッツバー
 */
export default function WorkshopHero({ stepsCount, docsCount }: WorkshopHeroProps) {
  const stats = [
    { value: String(stepsCount), label: "Steps", sub: "セットアップ〜検証まで" },
    { value: String(docsCount), label: "Docs", sub: "このページで配布" },
    { value: "7.5", label: "Sat", sub: "ワークショップ開催日" },
  ];

  return (
    <header className="relative">
      {/* ラベル + 日付の行 */}
      <div className="mt-6 md:mt-8 flex items-baseline justify-between gap-4">
        <p
          className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-semibold tracking-[0.28em] uppercase font-line-seed-jp"
          style={{ color: WS_THEME.muted }}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: WS_THEME.ink }}
            aria-hidden
          />
          BONO Workshop
        </p>
        <p
          className="text-[11px] md:text-[12px] font-semibold tracking-[0.28em] uppercase font-line-seed-jp whitespace-nowrap"
          style={{ color: WS_THEME.muted }}
        >
          Saturday, July 5, 2026
        </p>
      </div>

      {/* セリフ体の大見出し */}
      <h1
        className="mt-8 md:mt-10 font-line-seed-jp font-extrabold text-[44px] md:text-[68px] leading-[1.15] tracking-[-0.01em]"
        style={{ color: WS_THEME.ink }}
      >
        AI×UI
        <br />
        ワークショップ
      </h1>

      {/* 説明 */}
      <p
        className="mt-7 max-w-[680px] text-[15px] md:text-[17px] font-medium leading-[190%] tracking-[0.02em] font-line-seed-jp"
        style={{ color: WS_THEME.body }}
      >
        <span style={{ color: WS_THEME.ink }} className="font-bold">
          AIを使ってユーザー理解するためのプロトタイピングを実践しよう。
        </span>
        このページの資料に沿ってワークショップを進めます。当日のプレゼンも、手を動かすときの手順もすべてここにあります。
      </p>

      {/* スタッツバー */}
      <div
        className="mt-10 grid grid-cols-3 border"
        style={{ borderColor: WS_THEME.hairline }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="px-5 py-5 md:px-7 md:py-6"
            style={
              i > 0 ? { borderLeft: `1px solid ${WS_THEME.hairline}` } : undefined
            }
          >
            <p
              className="font-line-seed-jp font-bold text-[26px] md:text-[32px] leading-none"
              style={{ color: WS_THEME.ink }}
            >
              {stat.value}
            </p>
            <p
              className="mt-2 text-[13px] md:text-[14px] font-semibold font-line-seed-jp"
              style={{ color: WS_THEME.body }}
            >
              {stat.label}
            </p>
            <p
              className="mt-0.5 text-[11px] md:text-[12px] font-line-seed-jp"
              style={{ color: WS_THEME.muted }}
            >
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
}
