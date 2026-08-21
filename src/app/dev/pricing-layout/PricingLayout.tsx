"use client";

/**
 * 料金ページ「ページ全体レイアウト」検証（/dev/pricing-layout）。
 *
 * 目的: ユーザーがこの場でプランを決めて課金に進める最適な「セクションの並べ方」を検証する。
 * 共通セクション（Hero / 価格カード / プラン説明 / 実績・アウトプット / 再掲CTA）は同じで、
 * 並び順だけを 3 案（L1/L2/L3）切り替えて比較する。
 *
 * 【各案の意図】
 *  - L1 王道（判断材料を順に）: Hero→価格→プラン説明→実績→再掲CTA。
 *      価格を先に見せ、詳細（説明）→社会的証明（実績）で納得を積み上げてから最後に再度CTA。
 *  - L2 信頼先出し（社会的証明で背中を押す）: Hero→実績→価格→プラン説明→再掲CTA。
 *      先に実績で信頼を作ってから価格を提示。「みんなやってる」で不安を下げてから判断させる。
 *  - L3 即決導線（価格を主役に・詳細は後）: Hero(簡潔)→価格→再掲CTA(一次)→プラン説明→実績。
 *      価格を最上部の主役にして即決を促す。詳細・実績は判断を保留した人向けに後段へ回す。
 *
 * 実装メモ:
 *  - URLクエリ `l`（L1既定|L2|L3）をホワイトリスト検証し、確認用スイッチャで切り替える
 *    （router.replace {scroll:false}）。不正値は L1 にフォールバック。
 *  - 期間 state（既定=3ヶ月）を保持して PlanCards に渡す。
 *  - 実績・アウトプットセクションは Server Component（Sanity 取得）を `achievementSlot`
 *    (ReactNode) として受け取り、指定順に差し込む。
 *  - 見出し階層: ページ h1 は 1 つだけ（page.tsx 側）。各セクションは既存の見出し
 *    （PlanCards=h2、PatternE2=TopSectionHeading h2、Achievement=h2、Hero/RepeatCta=h2）に委ねる。
 */

import { useCallback } from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanDuration } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { PlanCards } from "../pricing/PlanCards";
import { PatternE2 } from "../pricing-detail/PatternE2";
import { Hero } from "./Hero";
import { RepeatCta } from "./RepeatCta";

// --- レイアウト案の定義（クエリ値のホワイトリスト） --------------------------

const LAYOUTS = ["L1", "L2", "L3", "L4"] as const;
type LayoutKey = (typeof LAYOUTS)[number];
const DEFAULT_LAYOUT: LayoutKey = "L1";

/** クエリ値のホワイトリスト検証（不正値は既定へフォールバック） */
function parseLayout(v: string | null): LayoutKey {
  return LAYOUTS.includes(v as LayoutKey) ? (v as LayoutKey) : DEFAULT_LAYOUT;
}

/** 各案がどのセクションをどの順で並べるか（意図はファイル冒頭コメント参照） */
const SECTION_ORDER: Record<LayoutKey, SectionId[]> = {
  L1: ["hero", "price", "detail", "achievement", "repeatCta"],
  L2: ["hero", "achievement", "price", "detail", "repeatCta"],
  L3: ["hero", "price", "repeatCta", "detail", "achievement"],
  // L4: L3改。Hero(簡潔)→価格(詳細リンク付)→プラン説明→実績→価格再掲。
  //  価格カードを起点にし、詳細はpage内リンクで補完、末尾に価格を再掲して締める。
  L4: ["hero", "price", "detail", "achievement", "priceRepeat"],
};

const LAYOUT_LABELS: Record<LayoutKey, string> = {
  L1: "L1 王道",
  L2: "L2 信頼先出し",
  L3: "L3 即決導線",
  L4: "L4 L3改：カード起点＋末尾に価格再掲",
};

type SectionId =
  | "hero"
  | "price"
  | "detail"
  | "achievement"
  | "repeatCta"
  | "priceRepeat";

// --- 本体 --------------------------------------------------------------------

interface PricingLayoutProps {
  /** 実績・アウトプット（Server Component で Sanity 取得済みの ReactNode） */
  achievementSlot: ReactNode;
}

export function PricingLayout({ achievementSlot }: PricingLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const layout = parseLayout(searchParams.get("l"));

  // 期間 state（既定=3ヶ月主軸）。PlanCards の期間トグルで操作する。
  const [duration, setDuration] = useState<PlanDuration>(3);

  const switchLayout = useCallback(
    (next: LayoutKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("l", next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // L3 / L4 は Hero を簡潔化（価格を主役にするため導入は最小限・アンカー無し）
  const heroCompact = layout === "L3" || layout === "L4";

  const renderSection = (id: SectionId): ReactNode => {
    switch (id) {
      case "hero":
        return <Hero key="hero" compact={heroCompact} />;
      case "price":
        return (
          <PlanCards
            key="price"
            duration={duration}
            onDurationChange={setDuration}
            // L4: 各カード機能一覧末尾に「詳細を見る」→ プラン説明(PatternE2)へページ内遷移
            detailAnchors={
              layout === "L4"
                ? { standard: "#detail-standard", feedback: "#detail-feedback" }
                : undefined
            }
          />
        );
      case "detail":
        return <PatternE2 key="detail" />;
      case "achievement":
        return <div key="achievement">{achievementSlot}</div>;
      case "repeatCta":
        return <RepeatCta key="repeatCta" />;
      case "priceRepeat":
        // L4 末尾の価格再掲（共通 PlanCards を再利用）。バッジ/支払リンク/トグル無し、
        // 見出し差し替え。期間は上のトグルと同じ duration state を共有（連動）。
        return (
          <PlanCards
            key="priceRepeat"
            duration={duration}
            onDurationChange={setDuration}
            heading="まずは気になるプランから始めよう"
            showBadge={false}
            showPaymentLink={false}
            showToggle={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-8">
      {/* ページ主見出し（h1 は全体で 1 つだけ） */}
      <h1 className="font-heading text-lg font-bold text-foreground">
        料金ページ（レイアウト検証）
      </h1>

      {/* 確認用スイッチャ（dev のみ。並び順だけを切り替えて比較する） */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
        <span className="text-xs font-bold text-muted-foreground">
          レイアウト案:
        </span>
        {LAYOUTS.map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={layout === key ? "default" : "outline"}
            onClick={() => switchLayout(key)}
          >
            {LAYOUT_LABELS[key]}
          </Button>
        ))}
      </div>

      {/* セクション本体（案ごとの順序で縦積み） */}
      <div className="mt-10 flex flex-col gap-16">
        {SECTION_ORDER[layout].map((id) => renderSection(id))}
      </div>
    </div>
  );
}
