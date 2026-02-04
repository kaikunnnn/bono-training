import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanity';

/**
 * Sanity Lesson型
 */
interface SanityLesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  thumbnail?: any;
  thumbnailUrl?: string;
  iconImage?: any;
  iconImageUrl?: string;
  category?: { title?: string } | string;
  categoryTitle?: string;
  tags?: string[];
  isPremium: boolean;
  webflowSource?: string;
}

/**
 * レッスン一覧の型（Sanityデータのみ）
 */
export type IntegratedLesson = SanityLesson;

/**
 * Sanityからレッスン一覧を取得
 *
 * パフォーマンス改善（2025-01-26）:
 * - 一覧ページではSanityデータのみ使用
 * - Webflow Edge Function呼び出しを削除
 * - 読み込み時間: ~4秒 → ~0.6秒
 *
 * 詳細ページでは引き続きWebflowデータを取得可能（useLessonDetail hook）
 */
async function fetchLessons(): Promise<SanityLesson[]> {
  const query = `*[_type == "lesson"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    thumbnail,
    thumbnailUrl,
    iconImage,
    iconImageUrl,
    category,
    "categoryTitle": category->title,
    tags,
    isPremium,
    webflowSource
  }`;

  return client.fetch(query);
}

/**
 * レッスン一覧取得フック
 *
 * 一覧ページではSanityからのデータのみを使用し、
 * Webflow APIは呼び出さない（パフォーマンス最適化）
 */
export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
