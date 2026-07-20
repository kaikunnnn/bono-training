import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import CoursePromoCard, {
  type CoursePromoCardProps,
} from "@/components/top/home/CoursePromoCard";

/**
 * コース訴求カード セクション（新トップ 2026 / ブロック4）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 671-7219
 *
 * ブロック3（CourseBannerSection）を置き換えず、独立ブロックとして並存させる。
 * CoursePromoCard を2枚横並びで見せる（モバイル縦積み / sm 以上で2カラム）。
 */

export interface CoursePromoSectionProps {
  /** セクション見出し */
  heading?: string;
  /** 見出し右のリンク */
  allCoursesLink?: { label: string; href: string };
  /** 表示するカード（2枚想定） */
  cards?: CoursePromoCardProps[];
  className?: string;
}

const DEFAULT_CARDS: CoursePromoCardProps[] = [
  {
    layout: "default",
    categoryLabel: "UIUX転職",
    typeLabel: "ロードマップ",
    visual: {
      type: "collage",
      images: [
        { src: "/images/top/course/collage-1.png", alt: "" },
        { src: "/images/top/course/collage-2.png", alt: "" },
        { src: "/images/top/course/collage-3.png", alt: "" },
        { src: "/images/top/course/collage-4.png", alt: "" },
      ],
    },
    title: "UIUX転職ロードマップ",
    description: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
    href: "/roadmap",
  },
  {
    layout: "title-first",
    categoryLabel: "UIの見た目",
    typeLabel: "トレーニング",
    visual: {
      type: "single",
      image: { src: "/images/top/course/badge-ui-visual.png", alt: "" },
      gradientPreset: "ui-visual",
    },
    title: "UIビジュアル基礎",
    description: "見た目を整える基本の型を身につけるトレーニング",
    href: "/training",
  },
];

export default function CoursePromoSection({
  heading = "あなたにおすすめのコース",
  allCoursesLink = { label: "すべてのコースを見る", href: "/roadmap" },
  cards = DEFAULT_CARDS,
  className,
}: CoursePromoSectionProps) {
  if (!cards?.length) return null;

  return (
    <section className={cn("flex flex-col gap-10", className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-rounded-mplus text-2xl font-bold leading-[1.35] text-text-primary sm:text-[28px]">
          {heading}
        </h2>
        {allCoursesLink && (
          <Link
            href={allCoursesLink.href}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-text-primary hover:underline"
          >
            {allCoursesLink.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {/* カード 2枚 */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6">
        {cards.map((card, i) => (
          <CoursePromoCard key={i} {...card} />
        ))}
      </div>
    </section>
  );
}
