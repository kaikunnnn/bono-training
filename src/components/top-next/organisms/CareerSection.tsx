import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { PromoCard } from "@/components/top-next/molecules/PromoCard";

/**
 * UIUXデザイナーに転職する（新トップページ Figma Make HANDOFF / CareerSection）
 *
 * コピーは /dev/top3 の CourseHighlightSection2 と同一。見出しは top4 で統一した
 * 共通コンポーネント TopSectionHeading を使う。
 * 2枚目は外部リンク（キャリアガイド、外部のためサムネイル取得対象外）。
 *
 * TrainingSection・FeaturedSeries と同じ PromoCard を使用（旧 RoadmapCard は統合済み）。
 * 1枚目のサムネイルは page.tsx 側でリンク先ロードマップの実画像を取得して props で渡す
 * （試験適用。無ければグレープレースホルダーのまま）。
 */
export interface CareerSectionProps {
  image1?: string;
}

export function CareerSection({ image1 }: CareerSectionProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.1] pt-[64px] pb-[65px]">
        <TopSectionHeading
          badgeLabel="転職×基礎習得"
          heading="UIUXデザイナーに転職する"
          className="mb-12"
        />
        <div className="flex flex-col gap-6 lg:flex-row">
          <PromoCard
            title="UIUX転職ロードマップ"
            description="6-8ヶ月で未経験からUIUXの基礎を習得"
            href="/roadmap"
            rounded="16px"
            image={image1}
          />
          <PromoCard
            title="未経験からのUIUXデザイナー転職ガイド"
            description="ポートフォリオや面接など転職準備をまとめて解説"
            href="https://kaikun.bo-no.design/career/beginner"
            external
          />
        </div>
      </div>
    </section>
  );
}
