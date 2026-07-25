import { WS_THEME } from "./theme";

/**
 * トップページ ブロック1
 * ラベル+日付の行 → 大見出し → 説明 → 境界線
 */
export default function WorkshopHero() {
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
        プロトタイピング
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

      {/* 今日考えることの一言 */}
      <p
        className="mt-6 max-w-[680px] text-[15px] md:text-[17px] font-bold leading-[190%] tracking-[0.02em] font-line-seed-jp border-l-4 pl-4"
        style={{ color: WS_THEME.ink, borderColor: WS_THEME.dotted }}
      >
        「気になるジャンル（例：コンビニ）の出費に、ユーザーが自分で気づける体験を、どうデザインすると良いのか？」——今日はこれを考えます。
      </p>

      {/* 幅いっぱいの境界線 */}
      <hr
        className="mt-10 border-t"
        style={{ borderColor: WS_THEME.hairline }}
      />
    </header>
  );
}
