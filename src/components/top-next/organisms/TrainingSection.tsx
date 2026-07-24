import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { PromoCard } from "@/components/top-next/molecules/PromoCard";

/**
 * 課題解決のデザインをはじめる（新トップページ Figma Make HANDOFF / TrainingSection）
 *
 * コピーは /dev/top3 の CourseHighlightSection5 と同一。見出しは top4 で統一した
 * 共通コンポーネント TopSectionHeading を使う（HANDOFF独自の見出しスタイルは使わない）。
 * サムネイルは page.tsx 側でリンク先ロードマップの実画像を取得して props で渡す
 * （試験適用。無ければグレープレースホルダーのまま）。
 */
export interface TrainingSectionProps {
  image1?: string;
  image2?: string;
}

export function TrainingSection({ image1, image2 }: TrainingSectionProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.1] pt-[64px] pb-[65px]">
        <TopSectionHeading
          badgeLabel="デザイン基礎"
          heading="課題解決のデザインをはじめる"
          className="mb-12"
        />
        <div className="flex flex-col gap-6 lg:flex-row">
          <PromoCard
            title="情報設計×OOUIで実践するUIデザイン"
            description="情報設計とOOUIで目的達成のUIをデザインする"
            href="/roadmap/information-architecture"
            image={image1}
          />
          <PromoCard
            title="UXリサーチで顧客課題を解決するデザインの基本"
            description="UXリサーチで顧客課題を発見し解決策をデザイン"
            href="/roadmap/ux-design-basic"
            image={image2}
          />
        </div>
      </div>
    </section>
  );
}
