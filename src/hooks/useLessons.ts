import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanity';

/**
 * レッスン型定義
 *
 * Sanityに保存されているレッスンデータ。
 * Webflowからインポートされたレッスンの場合、coverImageUrlとiconImageUrlが設定される。
 */
export interface Lesson {
  /** レッスンID */
  _id: string;
  /** レッスンタイトル */
  title: string;
  /** URLスラッグ */
  slug: { current: string };
  /** 説明文 */
  description?: string;
  /** カバー画像（Sanity画像オブジェクト） */
  coverImage?: any;
  /** カバー画像URL（Webflowからインポートされた場合） */
  coverImageUrl?: string;
  /** アイコン画像URL（Webflowからインポートされた場合） */
  iconImageUrl?: string;
  /** カテゴリ（参照またはID） */
  category?: string | any;
  /** 有料レッスンフラグ */
  isPremium: boolean;
  /** Webflow Series ID（Webflowソースの場合のみ） */
  webflowSource?: string;
}

/**
 * Sanityからレッスン一覧を取得
 *
 * @returns レッスン一覧のPromise
 */
async function fetchLessons(): Promise<Lesson[]> {
  const query = `*[_type == "lesson"] {
    _id,
    title,
    slug,
    description,
    coverImage,
    coverImageUrl,
    iconImageUrl,
    category,
    isPremium,
    webflowSource
  }`;

  const lessons = await client.fetch<Lesson[]>(query);
  return lessons;
}

/**
 * レッスン一覧を取得するReact Queryフック
 *
 * Sanityから直接データを取得し、キャッシュする。
 * Webflow APIは呼ばないため、高速に動作する。
 *
 * @returns React Queryの結果オブジェクト
 *
 * @example
 * ```tsx
 * const { data: lessons, isLoading, error } = useLessons();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     {lessons?.map(lesson => (
 *       <LessonCard key={lesson._id} lesson={lesson} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを有効とする
    gcTime: 10 * 60 * 1000, // 10分間メモリに保持
    retry: 1, // エラー時1回リトライ
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再取得しない
  });
}
