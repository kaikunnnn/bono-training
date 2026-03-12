import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultCard from "@/components/search/SearchResultCard";
import {
  SearchContentType,
  groupSearchResults,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
} from "@/types/search";
import { useSearch } from "@/hooks/useSearch";
import { Search as SearchIcon, Loader2 } from "lucide-react";

/**
 * 検索結果ページ
 */
const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const typesParam =
    searchParams.get("types")?.split(",").filter(Boolean) || [];

  const [query, setQuery] = useState(queryParam);
  const [selectedTypes, setSelectedTypes] = useState<SearchContentType[]>(
    typesParam as SearchContentType[]
  );

  // Sanityからデータを取得して検索
  const { results, isLoading, error } = useSearch(query, selectedTypes);

  // グループ化された結果
  const groupedResults = useMemo(() => {
    return groupSearchResults(results);
  }, [results]);

  // URLパラメータの更新
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
    setSearchParams(params, { replace: true });
  }, [query, selectedTypes, setSearchParams]);

  // 検索ハンドラ
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  // フィルタ変更ハンドラ
  const handleTypeChange = (types: SearchContentType[]) => {
    setSelectedTypes(types);
  };

  // 表示するセクション（Sanityにはroadmapがないので除外）
  const availableTypes: SearchContentType[] = ["lesson", "article", "guide"];
  const sectionsToShow =
    selectedTypes.length > 0
      ? selectedTypes.filter((t) => availableTypes.includes(t))
      : availableTypes;

  return (
    <Layout>
      <div className="min-h-screen bg-[#F9F9F7]">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {/* タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              コンテンツを検索
            </h1>

            {/* 検索バー */}
            <SearchBar
              defaultValue={query}
              onSearch={handleSearch}
              navigateOnSearch={false}
              autoFocus={!query}
              showSuggestions={false}
            />

            {/* フィルター */}
            <div className="mt-6">
              <SearchFilters
                selectedTypes={selectedTypes}
                onTypeChange={handleTypeChange}
              />
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* ローディング */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">検索中...</span>
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="text-center py-16">
              <p className="text-red-600">
                データの取得に失敗しました。再度お試しください。
              </p>
            </div>
          )}

          {/* 結果表示 */}
          {!isLoading && !error && (
            <>
              {/* 結果サマリー */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {query ? (
                    <>
                      「<span className="font-medium text-gray-900">{query}</span>
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

              {/* 結果がない場合 */}
              {results.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    検索結果が見つかりませんでした
                  </h2>
                  <p className="text-gray-600">
                    別のキーワードで検索するか、フィルターを変更してみてください
                  </p>
                </div>
              )}

              {/* セクション別結果 */}
              {sectionsToShow.map((type) => {
                const sectionResults = groupedResults[type];
                if (!sectionResults || sectionResults.length === 0) return null;

                const icon = CONTENT_TYPE_ICONS[type];
                const label = CONTENT_TYPE_LABELS[type];

                return (
                  <section key={type} className="mb-10">
                    {/* セクションヘッダー */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{icon}</span>
                      <h2 className="text-lg font-bold text-gray-900">
                        {label}
                      </h2>
                      <span className="text-sm text-gray-500">
                        ({sectionResults.length}件)
                      </span>
                    </div>

                    {/* カードリスト */}
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
      </div>
    </Layout>
  );
};

export default Search;
