import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import CategoryNav from '@/components/common/CategoryNav';
import GuideCard from '@/components/guide/GuideCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuides } from '@/hooks/useGuides';
import { GUIDE_CATEGORIES } from '@/lib/guideCategories';
import type { GuideCategory } from '@/types/guide';

const CATEGORY_NAV_ITEMS = [
  { label: 'すべて', href: '/library' },
  ...GUIDE_CATEGORIES.map((cat) => ({
    label: cat.label,
    href: `/library?category=${cat.id}`,
  })),
];

const GuidePage = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') as GuideCategory | null;
  const { data: guides, isLoading } = useGuides();
  const reduceMotion = useReducedMotion();

  const filtered = React.useMemo(() => {
    if (!guides) return [];
    const base = selectedCategory
      ? guides.filter((g) => g.category === selectedCategory)
      : guides;
    return [...base].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [guides, selectedCategory]);

  const motionConfig = useMemo(() => {
    const ease = [0.22, 1, 0.36, 1] as const;
    const baseTransition = reduceMotion ? { duration: 0 } : { duration: 0.5, ease };
    const hidden = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 };

    return {
      container: {
        hidden: {},
        show: {
          transition: reduceMotion
            ? { staggerChildren: 0, delayChildren: 0 }
            : { staggerChildren: 0.06, delayChildren: 0.04 },
        },
      },
      item: {
        hidden,
        show: { opacity: 1, y: 0, transition: baseTransition },
      },
    };
  }, [reduceMotion]);

  return (
    <Layout>
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* ヒーロー */}
        <section className="pt-8 pb-10">
          <h1 className="text-4xl font-bold font-rounded-mplus mb-4">ガイド記事</h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
            デザインスキルを身につける上でのヒントになる記事置き場です💡何か書いて欲しい内容があれば質問で教えてください🙆
          </p>
        </section>

        {/* カテゴリタブ */}
        <CategoryNav items={CATEGORY_NAV_ITEMS} searchParamKey="category" />

        {/* 記事グリッド */}
        <section className="py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <motion.div
              variants={motionConfig.container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((guide) => (
                <motion.div key={guide.slug} variants={motionConfig.item}>
                  <GuideCard guide={guide} className="h-full" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default GuidePage;
