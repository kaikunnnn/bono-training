import { Metadata } from "next";
import { getAllGuidesFromSanity, getGuidesByCategoryFromSanity } from "@/lib/sanity";
import { GUIDE_CATEGORIES } from "@/lib/guideCategories";
import { GuideCard } from "@/components/guide/GuideCard";
import CategoryNav from "@/components/common/CategoryNav";
import type { GuideCategory } from "@/types/guide";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ガイド",
  description:
    "デザインスキルを身につける上でのヒントになる記事。キャリア、学習方法、業界動向などを解説します。",
  openGraph: {
    title: "ガイド | BONO",
    description:
      "デザインスキルを身につける上でのヒントになる記事。",
  },
  twitter: {
    title: "ガイド | BONO",
    description:
      "デザインスキルを身につける上でのヒントになる記事。",
  },
  alternates: { canonical: "/guide" },
};

const CATEGORY_NAV_ITEMS = [
  { label: "すべて", href: "/guide" },
  ...GUIDE_CATEGORIES.map((cat) => ({
    label: cat.label,
    href: `/guide?category=${cat.id}`,
  })),
];

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function GuidePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category as GuideCategory | undefined;

  const validCategory =
    category && GUIDE_CATEGORIES.some((c) => c.id === category)
      ? category
      : undefined;

  const guides = validCategory
    ? await getGuidesByCategoryFromSanity(validCategory)
    : await getAllGuidesFromSanity();

  return (
    <div className="min-h-screen">
      {/* ヒーロー */}
      <section className="px-6 pt-16 pb-10 max-w-[1440px] mx-auto">
        <h1 className="text-4xl font-bold font-rounded-mplus mb-4">ガイド</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
          デザインスキルを身につける上でのヒントになる記事置き場です。何か書いて欲しい内容があれば質問で教えてください
        </p>
      </section>

      {/* カテゴリタブ */}
      <div className="px-6 max-w-[1440px] mx-auto">
        <CategoryNav items={CATEGORY_NAV_ITEMS} />
      </div>

      {/* 記事グリッド */}
      <section className="px-6 py-10 max-w-[1440px] mx-auto">
        {guides.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            該当する記事がありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
