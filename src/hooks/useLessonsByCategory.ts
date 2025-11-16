import { useMemo } from "react";
import { useLessons } from "./useLessons";
import { useCategories } from "./useCategories";

/**
 * カテゴリIDを抽出するヘルパー関数
 *
 * @param category - カテゴリ（参照、ID、または文字列）
 * @param categories - カテゴリ一覧（文字列からIDへの変換用）
 * @returns カテゴリID
 */
function extractCategoryId(category: any, categories?: any[]): string | null {
  if (!category) return null;

  // 参照型の場合
  if (typeof category === 'object') {
    return category._ref || category._id || null;
  }

  // 文字列の場合、カテゴリタイトルからIDに変換
  if (typeof category === 'string' && categories) {
    const matchedCategory = categories.find(cat => cat.title === category);
    return matchedCategory?._id || null;
  }

  // それ以外の文字列（既にIDの可能性）
  return category;
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
      const categoryId = extractCategoryId(lesson.category, categories);
      return categoryId === category._id;
    });
  }, [lessons, category, categories]);

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
