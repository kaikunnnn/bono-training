import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import type { SanityRoadmapDetail, SanityRoadmapStep } from "@/types/sanity-roadmap";

/**
 * コンテンツ取得用の共通GROQフラグメント
 *
 * Sanityには2つのデータ構造が存在:
 * 1. 直接参照型: { _type: "reference", _ref: "..." }
 * 2. contentItem型: { _type: "contentItem", itemType: "lesson|roadmap|externalLink", lesson/roadmap: { _ref: "..." } }
 */
const CONTENTS_PROJECTION = `contents[]{
  // 直接参照型（lesson, roadmap）の場合
  _type == "reference" => @->{
    _id,
    _type,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
    "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
    gradientPreset,
    estimatedDuration
  },
  // contentItem型（lessonへのネスト参照）の場合
  _type == "contentItem" && itemType == "lesson" => lesson->{
    _id,
    _type,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
    "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url)
  },
  // contentItem型（roadmapへのネスト参照）の場合
  _type == "contentItem" && itemType == "roadmap" => roadmap->{
    _id,
    _type,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
    gradientPreset,
    estimatedDuration
  },
  // contentItem型（外部リンク）の場合
  _type == "contentItem" && itemType == "externalLink" => {
    "_key": _key,
    "_type": "externalLink",
    "url": externalUrl,
    "title": externalTitle,
    "description": externalDescription,
    "thumbnailUrl": externalThumbnailUrl
  },
  // 外部リンクの場合（直接型）
  _type == "externalLink" => {
    _key,
    _type,
    url,
    title,
    description,
    thumbnailUrl
  }
}`;

/**
 * ロードマップ一覧用の軽量データ型
 */
export interface RoadmapListItem {
  _id: string;
  title: string;
  shortTitle?: string;
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
 * NOTE: 開発中は全ロードマップを表示（本番リリース時にisPublishedフィルタを有効化）
 */
async function fetchRoadmaps(): Promise<RoadmapListItem[]> {
  // TODO: 本番リリース時に isPublished == true フィルタを復活させる
  const query = `*[_type == "roadmap"] | order(order asc) {
    _id,
    title,
    shortTitle,
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
    shortTitle,
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
      // 両方のフィールド名に対応: title/stepTitle, goals/stepGoals
      "title": coalesce(title, stepTitle),
      "goals": coalesce(goals, stepGoals),
      sections[] {
        _key,
        // 両方のフィールド名に対応: title/sectionTitle
        "title": coalesce(title, sectionTitle),
        description,
        ${CONTENTS_PROJECTION}
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
    shortTitle,
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
      // 両方のフィールド名に対応: title/stepTitle, goals/stepGoals
      "title": coalesce(title, stepTitle),
      "goals": coalesce(goals, stepGoals),
      sections[] {
        _key,
        // 両方のフィールド名に対応: title/sectionTitle
        "title": coalesce(title, sectionTitle),
        description,
        ${CONTENTS_PROJECTION}
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
