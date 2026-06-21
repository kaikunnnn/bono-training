import React from "react";
import Layout from "@/components/layout/Layout";
import HorizontalContentCard from "@/components/search/HorizontalContentCard";
import { searchResultToCardProps } from "@/components/search/searchResultToCardProps";
import { useSearchData } from "@/hooks/useSearch";
import { groupSearchResults } from "@/types/search";
import { Loader2 } from "lucide-react";

/**
 * /search 結果カード ショーケース（実データ）
 * Sanity から取得したレッスン / 記事 / ガイドを HorizontalContentCard で表示
 */

const MAX_PER_SECTION = 4;

const Section: React.FC<{
  title: string;
  count: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <section className="mb-12">
    <h2 className="text-lg font-bold text-gray-900 mb-3">
      {title}{" "}
      <span className="text-sm font-normal text-gray-500">({count}件)</span>
    </h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const SearchCardPreview: React.FC = () => {
  const { data, isLoading, error } = useSearchData();

  const grouped = data ? groupSearchResults(data) : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs text-gray-500 mb-1">/dev/search-card</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            検索結果カード ショーケース（実データ）
          </h1>
          <p className="text-sm text-gray-600">
            Sanity から取得したレッスン / 記事 / ガイドを各セクションに最大{" "}
            {MAX_PER_SECTION} 件ずつ表示。
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Sanity からデータ取得中...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-600">
            取得に失敗しました：{(error as Error).message}
          </div>
        )}

        {!isLoading && !error && grouped && (
          <>
            <Section
              title="📚 レッスン"
              count={Math.min(MAX_PER_SECTION, grouped.lesson.length)}
            >
              {grouped.lesson.slice(0, MAX_PER_SECTION).map((r) => {
                const props = searchResultToCardProps(r);
                return props ? (
                  <HorizontalContentCard key={r.id} {...props} />
                ) : null;
              })}
              {grouped.lesson.length === 0 && (
                <p className="text-sm text-gray-500">該当データなし</p>
              )}
            </Section>

            <Section
              title="📝 記事"
              count={Math.min(MAX_PER_SECTION, grouped.article.length)}
            >
              {grouped.article.slice(0, MAX_PER_SECTION).map((r) => {
                const props = searchResultToCardProps(r);
                return props ? (
                  <HorizontalContentCard key={r.id} {...props} />
                ) : null;
              })}
              {grouped.article.length === 0 && (
                <p className="text-sm text-gray-500">該当データなし</p>
              )}
            </Section>

            <Section
              title="💡 ガイド"
              count={Math.min(MAX_PER_SECTION, grouped.guide.length)}
            >
              {grouped.guide.slice(0, MAX_PER_SECTION).map((r) => {
                const props = searchResultToCardProps(r);
                return props ? (
                  <HorizontalContentCard key={r.id} {...props} />
                ) : null;
              })}
              {grouped.guide.length === 0 && (
                <p className="text-sm text-gray-500">該当データなし</p>
              )}
            </Section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchCardPreview;
