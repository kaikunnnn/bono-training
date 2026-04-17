import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultCard from "@/components/search/SearchResultCard";
import ChatInterface from "@/components/ai/ChatInterface";
import {
  SearchContentType,
  groupSearchResults,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
} from "@/types/search";
import { useSearch } from "@/hooks/useSearch";
import { Search as SearchIcon, Loader2, Sparkles } from "lucide-react";
import { trackSearch } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type SearchMode = "search" | "ai";

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "search") as SearchMode;
  const queryParam = searchParams.get("q") || "";
  const typesParam =
    searchParams.get("types")?.split(",").filter(Boolean) || [];

  const [query, setQuery] = useState(queryParam);
  const [selectedTypes, setSelectedTypes] = useState<SearchContentType[]>(
    typesParam as SearchContentType[]
  );

  const setMode = (newMode: SearchMode) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newMode === "search") {
          next.delete("mode");
        } else {
          next.set("mode", "ai");
        }
        return next;
      },
      { replace: true }
    );
  };

  const { results, isLoading, error } = useSearch(
    query,
    selectedTypes,
    mode === "search"  // AIモード時はSanityフェッチをスキップ
  );

  const groupedResults = useMemo(() => groupSearchResults(results), [results]);

  useEffect(() => {
    if (mode !== "search") return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
    setSearchParams(params, { replace: true });
  }, [query, selectedTypes, mode, setSearchParams]);

  useEffect(() => {
    if (query && !isLoading && mode === "search") {
      trackSearch(query, results.length);
    }
  }, [query, isLoading, results.length, mode]);

  const availableTypes: SearchContentType[] = ["lesson", "article", "guide"];
  const sectionsToShow =
    selectedTypes.length > 0
      ? selectedTypes.filter((t) => availableTypes.includes(t))
      : availableTypes;

  return (
    <Layout headerGradient={mode === "ai" ? "none" : undefined}>
      <div className={cn("flex flex-col", mode === "ai" && "h-[calc(100vh-64px)]")}>
        {/* ヘッダー: モード切替 + 検索UI */}
        <div className={cn("border-b border-gray-100 px-4", mode === "search" ? "py-8 sm:py-12" : "py-4")}>
          <div className="max-w-4xl mx-auto">
            {/* セグメントコントロール */}
            <div className={cn("flex", mode === "search" ? "mb-6" : "justify-center")}>
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setMode("search")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                    mode === "search"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <SearchIcon className="w-3.5 h-3.5" />
                  検索
                </button>
                <button
                  onClick={() => setMode("ai")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                    mode === "ai"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AIに聞く
                </button>
              </div>
            </div>

            {/* 検索モード: 検索バー + フィルター */}
            {mode === "search" && (
              <>
                <SearchBar
                  defaultValue={query}
                  onSearch={(q) => setQuery(q)}
                  navigateOnSearch={false}
                  autoFocus={!query}
                  showSuggestions={false}
                />
                <div className="mt-6">
                  <SearchFilters
                    selectedTypes={selectedTypes}
                    onTypeChange={setSelectedTypes}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* コンテンツエリア */}
        {mode === "ai" ? (
          <div className="flex-1 min-h-0">
            <ChatInterface />
          </div>
        ) : (
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
                        「<span className="font-medium text-gray-900">{query}</span>」の検索結果：
                        <span className="font-bold text-gray-900">{results.length}</span>件
                      </>
                    ) : (
                      <>
                        全コンテンツ：
                        <span className="font-bold text-gray-900">{results.length}</span>件
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
                    <p className="text-gray-600 mb-4">
                      別のキーワードで検索するか、フィルターを変更してみてください
                    </p>
                    <button
                      onClick={() => setMode("ai")}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AIに聞いてみる
                    </button>
                  </div>
                )}

                {sectionsToShow.map((type) => {
                  const sectionResults = groupedResults[type];
                  if (!sectionResults || sectionResults.length === 0) return null;
                  return (
                    <section key={type} className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{CONTENT_TYPE_ICONS[type]}</span>
                        <h2 className="text-lg font-bold text-gray-900">
                          {CONTENT_TYPE_LABELS[type]}
                        </h2>
                        <span className="text-sm text-gray-500">
                          ({sectionResults.length}件)
                        </span>
                      </div>
                      <div className="space-y-4">
                        {sectionResults.map((result) => (
                          <SearchResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
