import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import LessonCard from "@/components/lessons/LessonCard";
import { Lesson } from "@/types/lesson";

export default function Lessons() {
  const navigate = useNavigate();
  const { data: lessons, isLoading: loading, error } = useLessons();
  const reduceMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // カテゴリ一覧を抽出
  const categories = useMemo(() => {
    if (!lessons) return [];
    const categorySet = new Set<string>();
    lessons.forEach((lesson) => {
      const categoryValue =
        typeof lesson.category === "string"
          ? lesson.category
          : lesson.categoryTitle || "";
      if (categoryValue) {
        categorySet.add(categoryValue);
      }
    });
    return Array.from(categorySet).sort();
  }, [lessons]);

  // フィルタリングされたレッスン
  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!selectedCategory) return lessons;
    return lessons.filter((lesson) => {
      const categoryValue =
        typeof lesson.category === "string"
          ? lesson.category
          : lesson.categoryTitle || "";
      return categoryValue === selectedCategory;
    });
  }, [lessons, selectedCategory]);

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

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold mb-4">レッスン一覧</h1>
          <p className="text-red-600">
            エラー:{" "}
            {error instanceof Error
              ? error.message
              : "データの取得に失敗しました"}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          label="Lesson"
          title="レッスン一覧"
          description="UIデザインを学ぶためのレッスン一覧です。カテゴリで絞り込めます。"
        />

        {/* カテゴリフィルター */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              すべて ({lessons.length})
            </button>
            {categories.map((category) => {
              const count = lessons.filter((l) => {
                const catValue =
                  typeof l.category === "string"
                    ? l.category
                    : l.categoryTitle || "";
                return catValue === category;
              }).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        )}

        {filteredLessons.length === 0 ? (
          <p className="text-zinc-500">
            {selectedCategory
              ? `「${selectedCategory}」カテゴリのレッスンはありません。`
              : "レッスンがありません。"}
          </p>
        ) : (
          <motion.div
            variants={motionConfig.container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
          >
            {filteredLessons.map((sanityLesson) => {
              // バッジ表示テキスト（カテゴリ > タグ）
              const categoryValue =
                typeof sanityLesson.category === "string"
                  ? sanityLesson.category
                  : sanityLesson.categoryTitle || "";

              const badgeLabel = categoryValue;

              // レッスン画像URL（アイコン優先）
              // 優先順位: iconImageUrl > iconImage > thumbnailUrl (Webflow) > thumbnail (Sanity image)
              const thumbnailUrl =
                sanityLesson.iconImageUrl ||
                (sanityLesson.iconImage
                  ? urlFor(sanityLesson.iconImage).width(216).height(326).url()
                  : null) ||
                sanityLesson.thumbnailUrl ||
                (sanityLesson.thumbnail
                  ? urlFor(sanityLesson.thumbnail).width(600).height(450).url()
                  : null) ||
                "";

              // SanityLessonからLesson型に変換
              const lesson: Lesson = {
                id: sanityLesson._id,
                title: sanityLesson.title,
                description: sanityLesson.description || "",
                category: badgeLabel,
                thumbnail: thumbnailUrl,
                slug: sanityLesson.slug.current,
              };

              return (
                <motion.div key={lesson.id} variants={motionConfig.item}>
                  <LessonCard
                    lesson={lesson}
                    onClick={() => handleLessonClick(lesson.slug)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
