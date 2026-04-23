import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CategoryNav from '@/components/common/CategoryNav';
import GuideCard from '@/components/guide/GuideCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuides } from '@/hooks/useGuides';
import { GUIDE_CATEGORIES } from '@/lib/guideCategories';
import type { GuideCategory } from '@/types/guide';

const CATEGORY_NAV_ITEMS = [
  { label: 'すべて', href: '/guide' },
  ...GUIDE_CATEGORIES.map((cat) => ({
    label: cat.label,
    href: `/guide?category=${cat.id}`,
  })),
];

const GuidePage = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') as GuideCategory | null;
  const { data: guides, isLoading } = useGuides();

  const filtered = React.useMemo(() => {
    if (!guides) return [];
    const base = selectedCategory
      ? guides.filter((g) => g.category === selectedCategory)
      : guides;
    return [...base].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [guides, selectedCategory]);

  return (
    <Layout>
      {/* ヒーロー */}
      <section className="px-6 pt-16 pb-10 max-w-[1440px] mx-auto">
        <h1 className="text-4xl font-bold font-rounded-mplus mb-4">ガイド</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
          デザインスキルを身につける上でのヒントになる記事置き場です💡何か書いて欲しい内容があれば質問で教えてください🙆
        </p>
      </section>

      {/* カテゴリタブ */}
      <div className="px-6 max-w-[1440px] mx-auto">
        <CategoryNav items={CATEGORY_NAV_ITEMS} searchParamKey="category" />
      </div>

      {/* 記事グリッド */}
      <section className="px-6 py-10 max-w-[1440px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-video rounded-3xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            該当する記事がありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default GuidePage;
