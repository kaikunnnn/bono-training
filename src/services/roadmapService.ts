/**
 * ロードマップサービス
 *
 * ロードマップページで使用するSanityデータ取得関数
 */

import { client } from "@/lib/sanity";
import type { RoadmapLesson } from "@/types/roadmap";
import type {
  SanityRoadmapDetail,
  SanityRoadmapListItem,
  SanityRelatedRoadmap,
} from "@/types/sanity-roadmap";

// ============================================
// ロードマップ取得（Sanityスキーマ対応）
// ============================================

/**
 * スラッグからロードマップ詳細を取得
 *
 * @param slug - ロードマップのスラッグ
 * @returns ロードマップ詳細情報
 */
export async function getSanityRoadmapBySlug(
  slug: string
): Promise<SanityRoadmapDetail | null> {
  const query = `
    *[_type == "roadmap" && slug.current == $slug && isPublished == true][0] {
      _id,
      title,
      slug,
      description,
      tagline,
      "thumbnailUrl": thumbnail.asset->url,
      gradientPreset,
      estimatedDuration,
      howToNavigate,
      changingLandscape {
        description,
        items[] {
          title,
          description
        }
      },
      interestingPerspectives {
        description,
        items[] {
          title,
          description
        }
      },
      steps[] {
        _key,
        title,
        goals,
        sections[] {
          _key,
          title,
          description,
          contents[]-> {
            _id,
            _type,
            title,
            slug,
            description,
            "thumbnailUrl": thumbnail.asset->url,
            "iconImageUrl": iconImage.asset->url,
            gradientPreset,
            estimatedDuration,
            "stepCount": count(steps)
          }
        }
      }
    }
  `;

  return client.fetch<SanityRoadmapDetail | null>(query, { slug });
}

/**
 * 全ロードマップを取得（一覧用）
 *
 * @returns ロードマップ一覧
 */
export async function getAllSanityRoadmaps(): Promise<SanityRoadmapListItem[]> {
  const query = `
    *[_type == "roadmap" && isPublished == true] | order(order asc) {
      _id,
      title,
      slug,
      description,
      "thumbnailUrl": thumbnail.asset->url,
      gradientPreset,
      estimatedDuration,
      "stepCount": count(steps)
    }
  `;

  return client.fetch<SanityRoadmapListItem[]>(query);
}

/**
 * 関連ロードマップを取得（現在のロードマップを除外）
 *
 * @param excludeId - 除外するロードマップID
 * @param limit - 取得件数（デフォルト: 3）
 * @returns 関連ロードマップ一覧
 */
export async function getRelatedRoadmaps(
  excludeId: string,
  limit: number = 3
): Promise<SanityRelatedRoadmap[]> {
  const query = `
    *[_type == "roadmap" && isPublished == true && _id != $excludeId] | order(order asc) [0...$limit] {
      _id,
      title,
      slug,
      description,
      "thumbnailUrl": thumbnail.asset->url,
      gradientPreset,
      estimatedDuration,
      "stepCount": count(steps)
    }
  `;

  return client.fetch<SanityRelatedRoadmap[]>(query, { excludeId, limit });
}

// ============================================
// レッスン取得
// ============================================

/**
 * スラッグの配列からレッスン情報を取得
 * ロードマップの各ステップに紐づくレッスンを取得するために使用
 *
 * @param slugs - レッスンのスラッグ配列
 * @returns レッスン情報の配列
 */
export async function getLessonsBySlugs(
  slugs: string[]
): Promise<RoadmapLesson[]> {
  if (slugs.length === 0) {
    return [];
  }

  const query = `
    *[_type == "lesson" && slug.current in $slugs] {
      _id,
      title,
      "slug": slug.current,
      description,
      "iconImageUrl": iconImage.asset->url,
      "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
      isPremium
    }
  `;

  const lessons = await client.fetch<RoadmapLesson[]>(query, { slugs });

  // スラッグの順番を維持してソート
  const slugOrder = new Map(slugs.map((slug, index) => [slug, index]));
  return lessons.sort((a, b) => {
    const orderA = slugOrder.get(a.slug) ?? Infinity;
    const orderB = slugOrder.get(b.slug) ?? Infinity;
    return orderA - orderB;
  });
}

/**
 * コースのスラッグから、そのコースに含まれるレッスン一覧を取得
 * ※ 現在のSanity構造ではCourseスキーマがないため、
 *    静的データからlessonSlugsを取得してgetLessonsBySlugsを使用する
 *
 * @param courseSlug - コースのスラッグ
 * @returns レッスン情報の配列
 */
export async function getLessonsByCourseSlug(
  courseSlug: string
): Promise<RoadmapLesson[]> {
  // NOTE: Sanityに Course スキーマがあれば直接クエリできる
  // 現状は静的データと組み合わせて使用
  console.warn(
    `[getLessonsByCourseSlug] Course schema not available in Sanity. Use static data for course: ${courseSlug}`
  );
  return [];
}

/**
 * 全レッスンを取得（カテゴリでフィルタ可能）
 *
 * @param category - カテゴリ（"UI" | "情報設計" | "UX" など）
 * @returns レッスン情報の配列
 */
export async function getAllLessonsForRoadmap(
  category?: string
): Promise<RoadmapLesson[]> {
  const categoryFilter = category
    ? `&& category == $category`
    : "";

  const query = `
    *[_type == "lesson" ${categoryFilter}] | order(lessonNumber asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      "iconImageUrl": iconImage.asset->url,
      "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
      isPremium
    }
  `;

  return client.fetch<RoadmapLesson[]>(query, { category });
}

/**
 * レッスンの詳細情報を取得（ロードマップ用）
 *
 * @param slug - レッスンのスラッグ
 * @returns レッスン情報
 */
export async function getLessonBySlug(
  slug: string
): Promise<RoadmapLesson | null> {
  const query = `
    *[_type == "lesson" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      description,
      "iconImageUrl": iconImage.asset->url,
      "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
      isPremium
    }
  `;

  return client.fetch<RoadmapLesson | null>(query, { slug });
}

// ============================================
// レッスンスラッグの取得（静的データ用）
// ============================================

/**
 * カテゴリからレッスンスラッグ一覧を取得
 * 静的データのlessonSlugs設定に使用
 *
 * @param category - カテゴリ
 * @returns スラッグの配列
 */
export async function getLessonSlugsByCategory(
  category: string
): Promise<string[]> {
  const query = `
    *[_type == "lesson" && category == $category] | order(lessonNumber asc) {
      "slug": slug.current
    }
  `;

  const lessons = await client.fetch<{ slug: string }[]>(query, { category });
  return lessons.map((l) => l.slug);
}
