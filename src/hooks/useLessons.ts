import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanity';

/**
 * レッスンに紐づくロードマップ情報
 */
export interface LinkedRoadmap {
  slug: string;
  title: string;
  shortTitle?: string;
}

/**
 * Sanity Lesson型
 */
export interface SanityLesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  thumbnail?: any;
  thumbnailUrl?: string;
  iconImage?: any;
  iconImageUrl?: string;
  /** メインカテゴリ（LessonCardに表示） */
  category?: { title?: string } | string;
  categoryTitle?: string;
  /** 複数カテゴリ（タブ分類に使用） */
  categories?: { title?: string }[];
  categoryTitles?: string[];
  tags?: string[];
  isPremium: boolean;
  webflowSource?: string;
  /** 紐づくロードマップ（フロントエンドで結合） */
  linkedRoadmaps?: LinkedRoadmap[];
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
  try {
    const query = `*[_type == "lesson" && !(isHidden == true)] | order(_createdAt desc) {
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
      categories[]->{title},
      "categoryTitles": categories[]->title,
      tags,
      isPremium,
      webflowSource
    }`;

    return client.fetch(query);
  } catch (error) {
    console.error('レッスン一覧の取得に失敗:', error);
    throw new Error('レッスン一覧の読み込みに失敗しました。ページを更新してもう一度お試しください。');
  }
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

/**
 * ロードマップ→レッスンIDのマッピング型
 */
export interface RoadmapLessonMapping {
  roadmapSlug: string;
  roadmapTitle: string;
  roadmapShortTitle?: string;
  lessonIds: string[];
}

/**
 * ロードマップに紐づくレッスンIDのマッピングを取得
 *
 * Sanityのデータ構造:
 * - 直接参照型: steps[].sections[].contents[] が { _type: "reference", _ref: "lessonId" }
 * - contentItem型: steps[].sections[].contents[] が { _type: "contentItem", lesson: { _ref: "lessonId" } }
 */
async function fetchRoadmapLessonMappings(): Promise<RoadmapLessonMapping[]> {
  try {
    const query = `*[_type == "roadmap" && isPublished == true] {
      "roadmapSlug": slug.current,
      "roadmapTitle": title,
      "roadmapShortTitle": shortTitle,
      "lessonIds": steps[].sections[].contents[]{
        // 直接参照型
        _type == "reference" => @->{ _id, _type },
        // contentItem型
        _type == "contentItem" && itemType == "lesson" => lesson->{ _id, _type }
      }[_type == "lesson"]._id
    }`;

    return client.fetch(query);
  } catch (error) {
    console.error('ロードマップ→レッスンマッピングの取得に失敗:', error);
    throw new Error('ロードマップとレッスンの関連情報の読み込みに失敗しました。');
  }
}

/**
 * ロードマップ→レッスンマッピング取得フック
 */
export function useRoadmapLessonMappings() {
  return useQuery({
    queryKey: ['roadmap-lesson-mappings'],
    queryFn: fetchRoadmapLessonMappings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * レッスンID→紐づくロードマップのマップを作成
 */
export function buildLessonToRoadmapsMap(
  mappings: RoadmapLessonMapping[]
): Map<string, LinkedRoadmap[]> {
  const map = new Map<string, LinkedRoadmap[]>();

  for (const mapping of mappings) {
    const uniqueLessonIds = [...new Set(mapping.lessonIds.filter(Boolean))];
    for (const lessonId of uniqueLessonIds) {
      const existing = map.get(lessonId) || [];
      existing.push({
        slug: mapping.roadmapSlug,
        title: mapping.roadmapTitle,
        shortTitle: mapping.roadmapShortTitle,
      });
      map.set(lessonId, existing);
    }
  }

  return map;
}
