import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LessonCard from "@/components/lessons/LessonCard";
import { Lesson } from "@/types/lesson";

export default function Lessons() {
  const navigate = useNavigate();
  const { data: lessons, isLoading: loading, error } = useLessons();
  const reduceMotion = useReducedMotion();

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
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          レッスン一覧
        </h1>
        <p className="text-sm md:text-base !text-black mb-6">
          工事中です👷
          <br />
          デザインサイクルと一部、AI×リサーチ＆プロトタイプだけ見れます。
        </p>

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <motion.div
            variants={motionConfig.container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
          >
            {lessons.map((sanityLesson) => {
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
