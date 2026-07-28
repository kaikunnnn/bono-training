import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { PromoCard } from "@/components/top-next/molecules/PromoCard";

/**
 * デザインとキャリアを考える（新トップページ Figma Make HANDOFF / GuideSection）
 *
 * ダーク背景（bg-dark-section = #050423）。コピーは実際のガイド記事（Sanity）を使用。
 * このブロックだけ上部ボーダー無し（デザイン指示によりborder-t削除）。
 * 見出しは top4 で統一した共通コンポーネント TopSectionHeading（inverse指定）を使う。
 * カードは TrainingSection 等と同じ PromoCard（inverse指定。旧GuideCardは統合済み）。
 * データ（サムネイル含む）は page.tsx 側で取得して props で渡す。
 */
export interface GuideSectionItem {
  title: string;
  description: string;
  href: string;
  image?: string;
}

export interface GuideSectionProps {
  guides: GuideSectionItem[];
}

export function GuideSection({ guides }: GuideSectionProps) {
  return (
    <section className="bg-dark-section px-6 pt-[64px] pb-[80px] lg:px-[69px]">
      <div className="pt-[64px]">
        <TopSectionHeading
          badgeLabel="スキルガイド"
          heading="デザインとキャリアを考える"
          inverse
          className="mb-[64px]"
        />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
          {guides.map((guide) => (
            <PromoCard key={guide.title} {...guide} inverse />
          ))}
        </div>
      </div>
    </section>
  );
}
