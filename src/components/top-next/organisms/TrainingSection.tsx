import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { TrainingCard } from "@/components/top-next/molecules/TrainingCard";

/**
 * 課題解決のデザインをはじめる（新トップページ Figma Make HANDOFF / TrainingSection）
 *
 * コピーは /dev/top3 の CourseHighlightSection5 と同一。見出しは top4 で統一した
 * 共通コンポーネント TopSectionHeading を使う（HANDOFF独自の見出しスタイルは使わない）。
 */
export function TrainingSection() {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.1] pt-[64px] pb-[65px]">
        <TopSectionHeading
          badgeLabel="コーストレーニング"
          heading="課題解決のデザインをはじめる"
          className="mb-12"
        />
        <div className="flex flex-col gap-6 lg:flex-row">
          <TrainingCard
            topLabel="UIのアイデア"
            topSubLabel="トレーニング"
            title="目的からデザインを構築するトレーニング"
            description="UIの仕組みとユーザーから発想する基本の形を身につけます"
            href="/training"
          />
          <TrainingCard
            topLabel="顧客の課題解決"
            topSubLabel="トレーニング"
            title="顧客理解を価値に変換するデザイントレーニング"
            description="UXデザインの基本を顧客インタビューを通して習得。課題を見つけるデザイン"
            href="/training"
          />
        </div>
      </div>
    </section>
  );
}
