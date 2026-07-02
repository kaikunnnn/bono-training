import Image from "next/image";
import AccentBadge from "./AccentBadge";
import { WORKSHOP_META } from "@/lib/workshop/config";
import { WS_DARK } from "./theme";

interface WorkshopHeroProps {
  stepsCount: number;
  docsCount: number;
}

/**
 * トップページ ブロック1（ダークエディトリアル版）
 * アイキャッチ → ラベル+日付の行 → セリフ体の大見出し → 説明 → スタッツバー
 */
export default function WorkshopHero({ stepsCount, docsCount }: WorkshopHeroProps) {
  const stats = [
    { value: String(stepsCount), label: "Steps", sub: "セットアップ〜検証まで" },
    { value: String(docsCount), label: "Docs", sub: "このページで配布" },
    { value: "7.5", label: "Sat", sub: "ワークショップ開催日" },
  ];

  return (
    <header className="relative">
      {/* アイキャッチ（テスト用プレースホルダー画像） */}
      <div className="relative w-full aspect-[1080/400] rounded-[20px] overflow-hidden">
        <Image
          src={WORKSHOP_META.eyecatch}
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* 遊びのアクセントバッジ */}
        <div className="absolute right-6 bottom-5 md:right-10 md:bottom-7 w-[88px] h-[88px] md:w-[104px] md:h-[104px] rotate-6">
          <AccentBadge className="w-full h-full" />
        </div>
      </div>

      {/* ラベル + 日付の行 */}
      <div className="mt-12 md:mt-16 flex items-baseline justify-between gap-4">
        <p
          className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-semibold tracking-[0.28em] uppercase font-hind"
          style={{ color: WS_DARK.muted }}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: WS_DARK.ink }}
            aria-hidden
          />
          BONO Workshop
        </p>
        <p
          className="text-[11px] md:text-[12px] font-semibold tracking-[0.28em] uppercase font-hind whitespace-nowrap"
          style={{ color: WS_DARK.muted }}
        >
          Saturday, July 5, 2026
        </p>
      </div>

      {/* セリフ体の大見出し */}
      <h1
        className="mt-8 md:mt-10 font-serif-editorial italic font-medium text-[44px] md:text-[68px] leading-[1.15] tracking-[-0.01em]"
        style={{ color: WS_DARK.ink }}
      >
        AI×UI
        <br />
        ワークショップ
      </h1>

      {/* 説明 */}
      <p
        className="mt-7 max-w-[680px] text-[15px] md:text-[17px] font-medium leading-[190%] tracking-[0.02em] font-noto-sans-jp"
        style={{ color: WS_DARK.body }}
      >
        <span style={{ color: WS_DARK.ink }} className="font-bold">
          AIを使ってユーザー理解するためのプロトタイピングを実践しよう。
        </span>
        このページの資料に沿ってワークショップを進めます。当日のプレゼンも、手を動かすときの手順もすべてここにあります。
      </p>

      {/* スタッツバー */}
      <div
        className="mt-10 grid grid-cols-3 border"
        style={{ borderColor: WS_DARK.hairline }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="px-5 py-5 md:px-7 md:py-6"
            style={
              i > 0 ? { borderLeft: `1px solid ${WS_DARK.hairline}` } : undefined
            }
          >
            <p
              className="font-serif-editorial text-[26px] md:text-[32px] leading-none"
              style={{ color: WS_DARK.ink }}
            >
              {stat.value}
            </p>
            <p
              className="mt-2 text-[13px] md:text-[14px] font-semibold font-hind"
              style={{ color: WS_DARK.body }}
            >
              {stat.label}
            </p>
            <p
              className="mt-0.5 text-[11px] md:text-[12px] font-noto-sans-jp"
              style={{ color: WS_DARK.muted }}
            >
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
}
