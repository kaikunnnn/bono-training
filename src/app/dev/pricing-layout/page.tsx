import type { Metadata } from "next";
import { Suspense } from "react";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import { getAchievementGroups } from "@/lib/sanity";
import { PricingLayout } from "./PricingLayout";

/**
 * 料金ページ「ページ全体レイアウト」検証（/dev/pricing-layout）。
 *
 * ユーザーがこの場でプランを決めて課金に進める最適な「セクションの並べ方」を検証するため、
 * 共通セクション（Hero / 価格カード / プラン説明 / 実績・アウトプット / 再掲CTA）の並び順を
 * 3 案（L1/L2/L3）で切り替え比較できるようにする。案の意図は PricingLayout.tsx 参照。
 *
 * データ取得（Server Component）:
 *  - 実績・アウトプットは Sanity から getAchievementGroups(3) で取得し、
 *    AchievementHighlightSection を組み立てて ReactNode として client（PricingLayout）へ渡す
 *    （Server Component を Client Component の prop として渡すパターン）。
 *  - ⚠ Sanity 未設定環境（.env.local 無し）では取得が失敗しうる。try/catch し、失敗時は
 *    実績セクションを出さず、環境未接続の fallback メッセージに差し替えてページを壊さない。
 *
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。noindex。
 */

export const metadata: Metadata = {
  title: "料金ページ（レイアウト検証 /dev/pricing-layout）",
  robots: { index: false, follow: false },
};

async function buildAchievementSlot() {
  try {
    const groups = await getAchievementGroups(3);
    return (
      <AchievementHighlightSection
        compact
        paddingY={0}
        storyItems={groups.stories}
        outputItems={groups.outputs}
      />
    );
  } catch (error) {
    // Sanity 未接続（.env.local 無し）等で取得失敗 → セクションは出さず fallback を表示
    console.warn(
      "[pricing-layout] achievement 取得に失敗。fallback を表示します。",
      error
    );
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        （実績データは環境未接続のため非表示）
      </p>
    );
  }
}

export default async function PricingLayoutPage() {
  const achievementSlot = await buildAchievementSlot();

  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingLayout achievementSlot={achievementSlot} />
    </Suspense>
  );
}
