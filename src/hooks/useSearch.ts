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
    const normalizedQuery = query.toLowerCase().trim();
    results = results.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.category || "",
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
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
  const normalizedQuery = query.toLowerCase().trim();
  return data
    .filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.category || "",
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(normalizedQuery);
    })
    .slice(0, limit);
}

// 後方互換 re-export
export { CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS };
