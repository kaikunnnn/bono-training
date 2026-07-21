import { cn } from "@/lib/utils";
import CoursePromoCard, {
  type CoursePromoCardProps,
} from "@/components/top/home/CoursePromoCard";
import FeatureLinkGrid from "@/components/top/home/FeatureLinkGrid";

/**
 * 訴求3ブロック（新トップ 2026 / ブロックB）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 689-6919
 *
 * 縦に並ぶ2つのサブセクションをまとめた親コンポーネント:
 *   B-1: 最新コンテンツ訴求（spotlight カード3枚グリッド / node 662-40053）
 *   B-2: サービス機能訴求（FeatureLinkGrid / node 662-39678）
 *
 * ※ B-3「新着コンテンツ」は既存 NewContentSection（ブロック2）と同一のため
 *   このセクションには含めず、page.tsx 側で NewContentSection を使う。
 */

/**
 * B-1 の3枚（トップ向けの仮コピー。ロードマップ / レッスン / 記事の3種）。
 * image はダミー（既存 course 配下の画像を流用）。
 */
const SPOTLIGHT_CARDS: CoursePromoCardProps[] = [
  {
    layout: "title-first",
    categoryLabel: "",
    typeLabel: "",
    visual: {
      type: "spotlight",
      image: { src: "/images/top/course/collage-1.png", alt: "" },
    },
    title: "UIUX転職ロードマップ",
    description: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
    href: "/roadmap",
  },
  {
    layout: "title-first",
    categoryLabel: "",
    typeLabel: "",
    visual: {
      type: "spotlight",
      image: { src: "/images/top/course/collage-2.png", alt: "" },
    },
    title: "UIデザインサイクルを学ぶ",
    description: "デザインが上手くなる基本の型を身につけるレッスン",
    href: "/lessons",
  },
  {
    layout: "title-first",
    categoryLabel: "",
    typeLabel: "",
    visual: {
      type: "spotlight",
      image: { src: "/images/top/course/collage-3.png", alt: "" },
    },
    title: "デザインの進め方ガイド",
    description: "実践で使えるデザインプロセスを解説する記事",
    href: "/guide",
  },
];

export interface HighlightPromoSectionProps {
  className?: string;
}

export default function HighlightPromoSection({
  className,
}: HighlightPromoSectionProps) {
  return (
    <section className={cn("flex flex-col", className)}>
      {/* B-1: 最新コンテンツ訴求（spotlight カード3枚 / border-b区切り, pt-64 pb-65, gap-24） */}
      <div className="border-b border-black/[0.12] pt-16 pb-[65px]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SPOTLIGHT_CARDS.map((card, i) => (
            <CoursePromoCard key={i} {...card} />
          ))}
        </div>
      </div>

      {/* B-2: サービス機能訴求（見出し「目的から探す」込み。FeatureLinkGrid が自身の border-b/py を持つ） */}
      <FeatureLinkGrid />
    </section>
  );
}
