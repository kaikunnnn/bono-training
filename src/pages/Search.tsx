import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SearchBar from "@/components/search/SearchBar";
import SearchTabs, { SearchTab } from "@/components/search/SearchTabs";
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
import { runDiagnostics } from "@/lib/diagnostics";

const AVAILABLE_TYPES: SearchContentType[] = ["lesson", "article", "guide"];

/** URL クエリから現在の tab を解決（後方互換: mode=ai / types=lesson も拾う） */
const resolveTab = (params: URLSearchParams): SearchTab => {
  const tabParam = params.get("tab");
  if (tabParam) {
    if (tabParam === "ai" || tabParam === "all") return tabParam;
    if ((AVAILABLE_TYPES as string[]).includes(tabParam)) {
      return tabParam as SearchTab;
    }
  }
  if (params.get("mode") === "ai") return "ai";
  const firstType = params.get("types")?.split(",").filter(Boolean)[0];
  if (firstType && (AVAILABLE_TYPES as string[]).includes(firstType)) {
    return firstType as SearchTab;
  }
  return "all";
};

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = resolveTab(searchParams);
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);

  const setTab = (newTab: SearchTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const q = prev.get("q");
        if (q) next.set("q", q);
        if (newTab !== "all") next.set("tab", newTab);
        return next;
      },
      { replace: true }
    );
  };

  // tab が変わったら、それに応じて useSearch に渡す types を計算
  const searchTypes: SearchContentType[] = useMemo(() => {
    if (tab === "ai" || tab === "all") return [];
    return [tab];
  }, [tab]);

  const { results, isLoading, error } = useSearch(
    query,
    searchTypes,
    tab !== "ai" // AI タブでも結果は裏で取得（タブ復帰時の即時表示のため）
  );

  const groupedResults = useMemo(() => groupSearchResults(results), [results]);

  // クエリ変更を URL に反映（AI タブでも q は同期する。tab は維持）
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        if (query) next.set("q", query);
        const currentTab = prev.get("tab");
        if (currentTab) next.set("tab", currentTab);
        // 旧パラメータ（mode/types）が残ってたら正規化のため明示的に消す
        return next;
      },
      { replace: true }
    );
  }, [query, setSearchParams]);

  useEffect(() => {
    if (query && !isLoading && tab !== "ai") {
      trackSearch(query, results.length);
    }
  }, [query, isLoading, results.length, tab]);

  useEffect(() => {
    if (error) {
      console.warn(
        "[BONO] /search でエラーが発生しました。診断を実行します..."
      );
      runDiagnostics();
    }
  }, [error]);

  const sectionsToShow: SearchContentType[] =
    tab === "all" ? AVAILABLE_TYPES : tab === "ai" ? [] : [tab];

  return (
    <Layout>
      <div
        className={cn(
          "flex flex-col",
          tab === "ai" && "h-[calc(100vh-64px)]"
        )}
      >
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

        {/* 検索結果エリア: AI タブでは非表示だがマウントは継続せず（結果は API キャッシュ） */}
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
                        <span className="font-medium text-gray-900">
                          {query}
                        </span>
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
                    <p className="text-gray-600 mb-4">
                      別のキーワードで検索するか、AIに聞いてみてください
                    </p>
                    <button
                      onClick={() => setTab("ai")}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AIに聞いてみる
                    </button>
                  </div>
                )}

                {sectionsToShow.map((type) => {
                  const sectionResults = groupedResults[type];
                  if (!sectionResults || sectionResults.length === 0)
                    return null;
                  return (
                    <section key={type} className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">
                          {CONTENT_TYPE_ICONS[type]}
                        </span>
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

        {/* AI チャット: 常時マウント、AI 以外のタブでは display:none で隠して履歴保持 */}
        <div className={cn(tab === "ai" ? "flex-1 min-h-0" : "hidden")}>
          <ChatInterface initialInput={query} />
        </div>
      </div>
    </Layout>
  );
};

export default Search;
