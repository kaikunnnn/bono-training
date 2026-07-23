import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { RoadmapCard } from "@/components/top-next/molecules/RoadmapCard";

/**
 * UIUXデザイナーに転職する（新トップページ Figma Make HANDOFF / CareerSection）
 *
 * コピーは /dev/top3 の CourseHighlightSection2 と同一。見出しは top4 で統一した
 * 共通コンポーネント TopSectionHeading を使う。
 * 2枚目は外部リンク（キャリアガイド）。
 *
 * RoadmapCard に description が無いのは意図的（HANDOFF原本の RoadmapCardProps 仕様通り。
 * TrainingCard とは違い説明文を持たないカードデザイン）。
 */
export function CareerSection() {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.1] pt-[64px] pb-[65px]">
        <TopSectionHeading
          badgeLabel="DESIGN WITH USER"
          heading="UIUXデザイナーに転職する"
          className="mb-12"
        />
        <div className="flex flex-col gap-6 lg:flex-row">
          <RoadmapCard
            topLabel="UIUX転職"
            topSubLabel="ロードマップ"
            title="UIUX転職ロードマップ"
            href="/roadmap"
            rounded="16px"
          />
          <RoadmapCard
            topLabel="UIUX転職"
            topSubLabel="ロードマップ"
            title="未経験からのUIUXデザイナー転職ガイド"
            href="https://kaikun.bo-no.design/career/beginner"
            external
          />
        </div>
      </div>
    </section>
  );
}
