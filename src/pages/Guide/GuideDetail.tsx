import React from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  GuideLayout,
  GuideHeader,
  GuideContent,
  RelatedGuides,
  TableOfContents,
} from "@/components/guide";
import ContentWrapper from "@/components/training/ContentWrapper";
import { useGuide } from "@/hooks/useGuides";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ガイド詳細ページ
 */
const GuideDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: guide, isLoading, error } = useGuide(slug || "");

  // ローディング状態
  if (isLoading) {
    return (
      <GuideLayout>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3 mb-6" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </GuideLayout>
    );
  }

  // エラー状態
  if (error) {
    return (
      <GuideLayout>
        <ContentWrapper className="py-12">
          <div className="text-center py-12 bg-white rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-red-600">ガイド記事の読み込みに失敗しました</p>
          </div>
        </ContentWrapper>
      </GuideLayout>
    );
  }

  // 記事が見つからない
  if (!guide) {
    return <Navigate to="/guide" replace />;
  }

  return (
    <GuideLayout>
      {/* ヘッダー */}
      <GuideHeader guide={guide} />

      {/* コンテンツ */}
      <div className="bg-white">
        <ContentWrapper className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
            {/* メインコンテンツ */}
            <div className="min-w-0">
              <GuideContent content={guide.content || ""} />
            </div>

            {/* 目次（デスクトップのみ） */}
            <aside className="hidden lg:block">
              <TableOfContents content={guide.content || ""} />
            </aside>
          </div>
        </ContentWrapper>
      </div>

      {/* 関連記事 */}
      {guide.relatedGuides && guide.relatedGuides.length > 0 && (
        <RelatedGuides
          relatedSlugs={guide.relatedGuides}
          currentSlug={guide.slug}
        />
      )}
    </GuideLayout>
  );
};

export default GuideDetailPage;
