import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { GuideCard } from "@/components/top-next/molecules/GuideCard";

/**
 * デザインとキャリアを考える（新トップページ Figma Make HANDOFF / GuideSection）
 *
 * ダーク背景（bg-dark-section = #050423）。コピーは /dev/top3 の
 * DesignCareerSection2 と同一（HANDOFFの仮コピーより top3 を優先）。
 * ボーダーは内側上部 border-t（白半透明）。見出しは top4 で統一した
 * 共通コンポーネント TopSectionHeading（inverse指定）を使う。
 */
const GUIDES = [
  {
    title: "AIとデザインで身につけるスキル",
    description: "生成AI時代に必要なデザインスキルを体系的に学ぶ",
    href: "/roadmap",
  },
  {
    title: "UXのロードマップ",
    description: "ユーザー理解から体験設計までを学ぶ学習ルート",
    href: "/roadmap",
  },
  {
    title: "UIUX転職ロードマップ",
    description: "未経験からUIUXデザイナーを目指すキャリアの道のり",
    href: "/roadmap",
  },
  {
    title: "プロのフィードバックで成長する",
    description: "現役デザイナーからのフィードバックでスキルを磨く",
    href: "/feedbacks",
  },
];

export function GuideSection() {
  return (
    <section className="bg-dark-section px-6 pt-[64px] pb-[80px] lg:px-[69px]">
      <div className="border-t border-white/[0.06] pt-[64px]">
        <TopSectionHeading
          badgeLabel="GUIDE CONTENTS"
          heading="デザインとキャリアを考える"
          inverse
          className="mb-[64px]"
        />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.title} {...guide} />
          ))}
        </div>
      </div>
    </section>
  );
}
