import "server-only";
/**
 * 記事ページの BONO 紹介ブロック（#280）用のロードマップ取得。
 * getAllRoadmaps は unstable_cache 済み（1時間）。同じリクエスト内の重複は React cache でまとめる。
 * 取得に失敗したら空配列（呼び出し側はブロックを出さない）。
 */
import { cache } from "react";
import { getAllRoadmaps } from "@/lib/sanity";
import type { SanityRoadmapListItem } from "@/types/sanity-roadmap";

export const getPromoRoadmaps = cache(async (): Promise<SanityRoadmapListItem[]> => {
  try {
    return await getAllRoadmaps();
  } catch (error) {
    console.error("[guide-promo] roadmap fetch failed", error);
    return [];
  }
});
