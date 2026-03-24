import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import type { SanityRoadmapDetail, SanityRoadmapStep } from "@/types/sanity-roadmap";

/**
 * ロードマップ一覧用の軽量データ型
 */
export interface RoadmapListItem {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  tagline?: string;
  thumbnailUrl?: string;
  gradientPreset: string;
  estimatedDuration: string;
  stepCount: number;
  order: number;
  isPublished: boolean;
}

/**
 * ロードマップ一覧を取得
 */
async function fetchRoadmaps(): Promise<RoadmapListItem[]> {
  const query = `*[_type == "roadmap" && isPublished == true] | order(order asc) {
    _id,
    title,
    slug,
    description,
    tagline,
    "thumbnailUrl": thumbnail.asset->url,
    gradientPreset,
    estimatedDuration,
    "stepCount": count(steps),
    order,
    isPublished
  }`;

  return client.fetch(query);
}

/**
 * ロードマップ一覧取得フック
 */
export function useRoadmaps() {
  return useQuery({
    queryKey: ["roadmaps"],
    queryFn: fetchRoadmaps,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
  });
}

/**
 * ロードマップ詳細を取得
 */
async function fetchRoadmapBySlug(slug: string): Promise<SanityRoadmapDetail | null> {
  const query = `*[_type == "roadmap" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    tagline,
    "thumbnailUrl": thumbnail.asset->url,
    gradientPreset,
    estimatedDuration,
    howToNavigate,
    changingLandscape,
    interestingPerspectives,
    order,
    isPublished,
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
          "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
          "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
          // ロードマップ用フィールド
          gradientPreset,
          estimatedDuration
        }
      }
    }
  }`;

  return client.fetch(query, { slug });
}

/**
 * ロードマップ詳細取得フック
 */
export function useRoadmap(slug: string | undefined) {
  return useQuery({
    queryKey: ["roadmap", slug],
    queryFn: () => (slug ? fetchRoadmapBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * 全ロードマップ詳細を取得（プレビュー用）
 */
async function fetchAllRoadmapsWithDetails(): Promise<SanityRoadmapDetail[]> {
  const query = `*[_type == "roadmap"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    tagline,
    "thumbnailUrl": thumbnail.asset->url,
    gradientPreset,
    estimatedDuration,
    howToNavigate,
    changingLandscape,
    interestingPerspectives,
    order,
    isPublished,
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
          "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
          "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
          // ロードマップ用フィールド
          gradientPreset,
          estimatedDuration
        }
      }
    }
  }`;

  return client.fetch(query);
}

/**
 * 全ロードマップ詳細取得フック（プレビュー用）
 */
export function useAllRoadmapsWithDetails() {
  return useQuery({
    queryKey: ["roadmaps", "all", "details"],
    queryFn: fetchAllRoadmapsWithDetails,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
