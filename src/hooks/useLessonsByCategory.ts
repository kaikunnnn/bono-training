import { useMemo } from "react";
import { useLessons } from "./useLessons";
import { useCategories } from "./useCategories";

/**
 * 指定されたカテゴリスラッグに属するレッスンを取得するフック
 */
export function useLessonsByCategory(categorySlug: string) {
  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useLessons();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // スラッグからカテゴリを検索
  const category = useMemo(() => {
    if (!categories) return null;
    return categories.find((cat) => cat.slug.current === categorySlug);
  }, [categories, categorySlug]);

  // カテゴリIDに一致するレッスンをフィルタリング
  const filteredLessons = useMemo(() => {
    if (!lessons || !category) return [];

    return lessons.filter((lesson) => {
      if (!lesson.category) return false;

      // categoryは参照型なので、_id、_ref、または文字列の可能性がある
      const categoryId = typeof lesson.category === 'string'
        ? lesson.category
        : (lesson.category as any)?._ref || (lesson.category as any)?._id;

      return categoryId === category._id;
    });
  }, [lessons, category]);

  return {
    lessons: filteredLessons,
    category,
    isLoading: lessonsLoading || categoriesLoading,
    error: lessonsError,
  };
}
