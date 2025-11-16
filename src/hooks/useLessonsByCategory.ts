import { useMemo } from "react";
import { useLessons } from "./useLessons";
import { useCategories } from "./useCategories";

/**
 * カテゴリIDを抽出するヘルパー関数
 *
 * @param category - カテゴリ（参照、ID、または文字列）
 * @returns カテゴリID
 */
function extractCategoryId(category: any): string | null {
  if (!category) return null;
  if (typeof category === 'string') return category;
  return category._ref || category._id || null;
}

/**
 * 指定されたカテゴリスラッグに属するレッスンを取得するフック
 *
 * @param categorySlug - カテゴリのスラッグ
 * @returns フィルタリングされたレッスン、カテゴリ情報、ローディング状態
 *
 * @example
 * ```tsx
 * const { lessons, category, isLoading } = useLessonsByCategory('ui');
 *
 * if (isLoading) return <div>Loading...</div>;
 *
 * return (
 *   <div>
 *     <h1>{category?.title}</h1>
 *     {lessons.map(lesson => (
 *       <LessonCard key={lesson._id} lesson={lesson} />
 *     ))}
 *   </div>
 * );
 * ```
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
      const categoryId = extractCategoryId(lesson.category);
      return categoryId === category._id;
    });
  }, [lessons, category]);

  return {
    /** フィルタリングされたレッスン一覧 */
    lessons: filteredLessons,
    /** カテゴリ情報 */
    category,
    /** ローディング中かどうか */
    isLoading: lessonsLoading || categoriesLoading,
    /** エラー情報 */
    error: lessonsError,
  };
}
