import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";

/**
 * カテゴリ型定義
 */
export interface Category {
  /** カテゴリID */
  _id: string;
  /** カテゴリ名 */
  title: string;
  /** URLスラッグ */
  slug: {
    current: string;
  };
  /** 表示順序（小さい順に表示） */
  order: number;
  /** カテゴリカラー（Hex形式） */
  color?: string;
  /** カテゴリの説明 */
  description?: string;
}

/**
 * Sanityからカテゴリ一覧を取得
 *
 * @returns カテゴリ一覧のPromise
 */
async function fetchCategories(): Promise<Category[]> {
  const query = `*[_type == "category"] | order(order asc) {
    _id,
    title,
    slug,
    order,
    color,
    description
  }`;

  const categories = await client.fetch<Category[]>(query);
  return categories;
}

/**
 * カテゴリ一覧を取得するReact Queryフック
 *
 * @returns React Queryの結果オブジェクト
 *
 * @example
 * ```tsx
 * const { data: categories, isLoading } = useCategories();
 *
 * return (
 *   <div>
 *     {categories?.map(category => (
 *       <CategoryCard key={category._id} category={category} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    gcTime: 10 * 60 * 1000, // 10分間メモリに保持
  });
}
