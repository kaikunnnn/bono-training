"use client";

import React, { Suspense, useEffect, useMemo, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SearchBar from "@/components/search/SearchBar";
import SearchTabs, { SearchTab } from "@/components/search/SearchTabs";
import HorizontalContentCard from "@/components/search/HorizontalContentCard";
import { searchResultToCardProps } from "@/components/search/searchResultToCardProps";
import ChatInterface from "@/components/ai/ChatInterface";
import {
  SearchContentType,
  groupSearchResults,
} from "@/types/search";
import { useSearch } from "@/hooks/useSearch";
import {
  Search as SearchIcon,
  Loader2,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { MenuIcons } from "@/components/layout/Sidebar/icons";
import type { SearchResult } from "@/types/search";
import { trackSearch } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { runDiagnostics } from "@/lib/diagnostics";
import { Button } from "@/components/ui/button";
import { SLACK_QUESTIONS_URL } from "@/lib/external-links";

/** タブ別に useSearch へ渡す型のマッピング */
const TAB_TO_TYPES: Record<Exclude<SearchTab, "ai" | "all">, SearchContentType[]> = {
  lesson: ["lesson"],
  guide: ["article", "guide"], // 記事はガイドに統合
};

/** URL クエリから現在の tab を解決（後方互換: mode=ai / types=lesson / tab=article も拾う） */
const resolveTab = (params: URLSearchParams | null): SearchTab => {
  if (!params) return "all";
  const tabParam = params.get("tab");
  if (tabParam) {
    if (tabParam === "ai" || tabParam === "all") return tabParam;
    if (tabParam === "lesson") return "lesson";
    // 記事は廃止 → ガイドに統合
    if (tabParam === "article" || tabParam === "guide") return "guide";
  }
  if (params.get("mode") === "ai") return "ai";
  const firstType = params.get("types")?.split(",").filter(Boolean)[0];
  if (firstType === "lesson") return "lesson";
  if (firstType === "article" || firstType === "guide") return "guide";
  return "all";
};

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams);
  const queryParam = searchParams?.get("q") || "";

  // URL を single source of truth に。内部 state は持たない。
  const query = queryParam;

  /** 現在の searchParams をベースに変更して /search?... に router.replace */
  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams?.toString() || "");
      mutate(next);
      // 旧パラメータ（mode / types）を明示的に正規化のため落とす
      next.delete("mode");
      next.delete("types");
      const qs = next.toString();
      router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    },
    [router, searchParams]
  );

  const setQuery = useCallback(
    (newQuery: string) => {
      updateParams((p) => {
        if (newQuery) p.set("q", newQuery);
        else p.delete("q");
      });
    },
    [updateParams]
  );

  const setTab = useCallback(
    (newTab: SearchTab) => {
      updateParams((p) => {
        if (newTab === "all") p.delete("tab");
        else p.set("tab", newTab);
      });
    },
    [updateParams]
  );

  // tab → useSearch に渡す types
  const searchTypes: SearchContentType[] = useMemo(() => {
    if (tab === "ai" || tab === "all") return [];
    return TAB_TO_TYPES[tab];
  }, [tab]);

  const { results, isLoading, error } = useSearch(
    query,
    searchTypes,
    tab !== "ai"
  );

  const groupedResults = useMemo(() => groupSearchResults(results), [results]);

  useEffect(() => {
    if (query && !isLoading && tab !== "ai") {
      trackSearch(query, results.length);
    }
  }, [query, isLoading, results.length, tab]);

  useEffect(() => {
    if (error) {
      console.warn("[BONO] /search でエラーが発生しました。診断を実行します...");
      runDiagnostics();
    }
  }, [error]);

  // ===== 表示用セクション（記事はガイドに統合）=====
  type SectionKey = "lesson" | "guide";
  const sections: {
    key: SectionKey;
    label: string;
    Icon: React.FC<{ size?: number; variant?: "Outline" | "Bold" | "Linear" | "Bulk" | "TwoTone" }>;
    results: SearchResult[];
  }[] = useMemo(() => {
    const all = [
      {
        key: "lesson" as const,
        label: "レッスン",
        Icon: MenuIcons.lesson,
        results: groupedResults.lesson as SearchResult[],
      },
      {
        key: "guide" as const,
        label: "ガイド",
        Icon: MenuIcons.guide,
        // 記事 + ガイドを統合
        results: [
          ...(groupedResults.guide as SearchResult[]),
          ...(groupedResults.article as SearchResult[]),
        ],
      },
    ];
    if (tab === "all") return all;
    if (tab === "ai") return [];
    return all.filter((s) => s.key === tab);
  }, [groupedResults, tab]);

  // ===== 各セクションの表示件数（最大 5 件 → さらに表示で +5）=====
  const INITIAL_VISIBLE = 5;
  const STEP = 5;
  const [visibleCount, setVisibleCount] = useState<
    Partial<Record<SectionKey, number>>
  >({});

  // クエリ / tab 変更時にリセット
  useEffect(() => {
    setVisibleCount({});
  }, [query, tab]);

  const getVisibleCount = useCallback(
    (key: SectionKey) => visibleCount[key] ?? INITIAL_VISIBLE,
    [visibleCount]
  );

  const showMore = useCallback((key: SectionKey) => {
    setVisibleCount((prev) => ({
      ...prev,
      [key]: (prev[key] ?? INITIAL_VISIBLE) + STEP,
    }));
  }, []);

  return (
    <div className={cn("flex flex-col", tab === "ai" && "h-[calc(100vh-64px)]")}>
      {/* ヘッダー: 「探す」見出し位置は固定、検索バーだけアニメーションで開閉 */}
      <div className="px-4 pt-8 sm:pt-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">探す</h1>
          <motion.div
            initial={false}
            animate={{
              height: tab !== "ai" ? 64 : 0,
              opacity: tab !== "ai" ? 1 : 0,
              marginBottom: tab !== "ai" ? 24 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
            aria-hidden={tab === "ai"}
          >
            <SearchBar
              key={queryParam}
              defaultValue={query}
              onSearch={(q) => setQuery(q)}
              navigateOnSearch={false}
              autoFocus={!query}
              showSuggestions={false}
            />
          </motion.div>
          <SearchTabs tab={tab} onTabChange={setTab} />
        </div>
      </div>

      {tab !== "ai" && (
        <div className="max-w-4xl mx-auto w-full px-4 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">検索中...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-600">
                データの取得に失敗しました。再度お試しください。
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {query ? (
                    <>
                      「
                      <span className="font-medium text-gray-900">{query}</span>
                      」の検索結果：
                      <span className="font-bold text-gray-900">
                        {results.length}
                      </span>
                      件
                    </>
                  ) : (
                    <>
                      全コンテンツ：
                      <span className="font-bold text-gray-900">
                        {results.length}
                      </span>
                      件
                    </>
                  )}
                </p>
              </div>

              {results.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    検索結果が見つかりませんでした
                  </h2>
                  <p className="text-gray-600 mb-6">
                    AI に聞くか、カイクンに直接質問してみましょう
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setTab("ai")}
                      className="gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      AIに聞く
                    </Button>
                    <Button variant="secondary" asChild className="gap-1.5">
                      <a
                        href={SLACK_QUESTIONS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        カイクンに質問する
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {sections.map((section) => {
                const sectionResults = section.results;
                if (!sectionResults || sectionResults.length === 0) return null;
                const visible = getVisibleCount(section.key);
                const visibleResults = sectionResults.slice(0, visible);
                const remaining = sectionResults.length - visible;
                const { Icon } = section;
                return (
                  <section key={section.key} className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon size={20} variant="Outline" />
                      <h2 className="text-lg font-bold text-gray-900">
                        {section.label}
                      </h2>
                      <span className="text-sm text-gray-500">
                        ({sectionResults.length}件)
                      </span>
                    </div>
                    <div className="space-y-4">
                      {visibleResults.map((result) => {
                        const props = searchResultToCardProps(result);
                        return props ? (
                          <HorizontalContentCard key={result.id} {...props} />
                        ) : null;
                      })}
                    </div>
                    {remaining > 0 && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => showMore(section.key)}
                          className="gap-1.5"
                        >
                          さらに {Math.min(STEP, remaining)} 件表示
                          <span className="text-xs text-gray-500">
                            （残り {remaining} 件）
                          </span>
                        </Button>
                      </div>
                    )}
                  </section>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* AI チャット: 常時マウント、AI 以外のタブでは display:none で隠して履歴保持 */}
      <div className={cn(tab === "ai" ? "flex-1 min-h-0" : "hidden")}>
        <ChatInterface initialInput={query} />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
