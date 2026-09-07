"use client";

import { useQuery } from "@tanstack/react-query";
import {
  SearchResult,
  SearchContentType,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
} from "@/types/search";

// ============================================================
// 検索データ取得（クライアントは /api/search を fetch するだけ）
// - CORS 回避（同一オリジン）
// - サーバー側で useCdn:true + Vercel s-maxage キャッシュで高速化
// ============================================================

async function fetchSearchData(): Promise<SearchResult[]> {
  const res = await fetch("/api/search");
  if (!res.ok) {
    throw new Error(`検索データの取得に失敗しました (${res.status})`);
  }
  return res.json() as Promise<SearchResult[]>;
}

// ============================================================
// 検索ロジック（クライアント側でフィルタリング）
// ============================================================

/**
 * クエリのマッチ判定
 * - 英数字のみのクエリ: 単語境界 (\b) で大文字小文字無視マッチ
 *   → 「AI」が「Daily」の "ai" に誤ヒットしないようにする
 * - それ以外（日本語など）: 通常の lowercase 部分一致
 *   → 「情」で「情報設計」がヒットする挙動を維持
 */
function matchesQuery(haystack: string, needle: string): boolean {
  const trimmed = needle.trim();
  if (!trimmed) return true;

  const isAsciiOnly = /^[\x20-\x7E]+$/.test(trimmed);
  if (isAsciiOnly) {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(haystack);
  }

  return haystack.toLowerCase().includes(trimmed.toLowerCase());
}

function buildSearchableText(item: SearchResult): string {
  return [
    item.title,
    item.description,
    item.category || "",
    ...(item.tags || []),
  ].join(" ");
}

function filterSearchResults(
  data: SearchResult[],
  query: string,
  contentTypes: SearchContentType[]
): SearchResult[] {
  let results = data;

  if (contentTypes.length > 0) {
    results = results.filter((item) => contentTypes.includes(item.type));
  }

  if (query.trim()) {
    results = results.filter((item) =>
      matchesQuery(buildSearchableText(item), query)
    );
  }

  return results;
}

// ============================================================
// React Query Hook
// ============================================================

/**
 * 検索データを取得するフック
 */
export function useSearchData(enabled = true) {
  return useQuery({
    queryKey: ["searchData"],
    queryFn: fetchSearchData,
    enabled,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
    refetchOnWindowFocus: false,
  });
}

/**
 * 検索を実行するフック
 * @param enabled false にすると fetch を完全にスキップ（AI モード時など）
 */
export function useSearch(
  query: string,
  contentTypes: SearchContentType[],
  enabled = true
) {
  const { data: allData, isLoading, error } = useSearchData(enabled);

  const results = allData ? filterSearchResults(allData, query, contentTypes) : [];

  return {
    results,
    isLoading,
    error,
    totalCount: results.length,
  };
}

/**
 * 検索候補を取得する関数（オートコンプリート用、キャッシュ済データから即時抽出）
 */
export function searchFromCache(
  data: SearchResult[] | undefined,
  query: string,
  limit = 8
): SearchResult[] {
  if (!data || !query.trim()) return [];
  return data
    .filter((item) => matchesQuery(buildSearchableText(item), query))
    .slice(0, limit);
}

// 後方互換 re-export
export { CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS };
