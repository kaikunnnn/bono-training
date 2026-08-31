/**
 * 料金ページの導入ヘッダー（左揃え・統合版）。
 *
 * Figma(43:4254) 準拠。旧ヒーロー（2段見出し＋border-b）と旧メンバーシップ見出しを
 * 1ブロックに統合し、ファーストビューにプランを収めるためヘッダーを圧縮した:
 *   「料金プラン」(ラベル・p) → 8px → h1「BONOをはじめよう：…」 → 12px → 支払いリンク。
 *
 * ページの h1 はこのブロックが担う（PlanCards からメンバーシップ見出しは撤去済み）。
 * 下境界（border-b）は撤去。フォントサイズは見た目、見出しレベルは文書構造で決める。
 */

import Link from "next/link";

export function PricingHero() {
  return (
    <section>
      {/* ラベル（見出しではなくアイブロウ）。text-sm / bold / foreground */}
      <p className="text-sm font-bold text-foreground">料金プラン</p>

      {/* ページ主見出し（h1）。font-heading 28px≈text-3xl / bold / leading tight */}
      <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-foreground">
        BONOをはじめよう：成長の&quot;環境&quot;と&quot;知識&quot;にアクセス
      </h1>

      {/* 支払いに関する質問（FAQページ・muted・下線） */}
      <Link
        href="/how-to/faq"
        className="mt-3 inline-block text-sm text-text-link underline underline-offset-4 hover:text-text-link-hover"
      >
        支払いに関する質問はこちら
      </Link>
    </section>
  );
}
