/**
 * 料金ページ レイアウト検証（/dev/pricing-layout）用の簡潔な Hero / 導入ブロック。
 *
 * このページ用の自作（既存に単体 Hero コンポーネントが無いため）。大きくしない・作り込まない
 * ことが主眼（このタスクはセクションの並び順＝情報設計の検証）。
 *
 * 見出しはページ h1 の下位なので h2。アンカーボタンは共通 Button（小さめ・ghost）で、
 * 下の価格カード（PlanCards が id="std" / id="feedback" を持つ）へスクロールさせる。
 * `compact` を渡すと L3（即決導線）向けにサブコピー/アンカーを省いてさらに簡潔にする。
 */

import { Button } from "@/components/ui/button";

interface HeroProps {
  /** L3（即決導線）用: サブコピーとアンカーボタンを省いて簡潔にする */
  compact?: boolean;
}

export function Hero({ compact = false }: HeroProps) {
  return (
    <section className="text-center">
      <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        BONOをはじめよう
      </h2>

      {!compact && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            プランを選択してBONOでの学習をはじめましょう。
          </p>

          {/* 下の価格カードへ飛ぶ小リンク（共通Button・小さめ・大きくしない） */}
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="#std">スタンダード ↓</a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="#feedback">フィードバック ↓</a>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
