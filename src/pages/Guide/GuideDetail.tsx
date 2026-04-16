import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { GuideHeader, GuideContent } from "@/components/guide";
import Layout from "@/components/layout/Layout";
import ContentWrapper from "@/components/training/ContentWrapper";
import { useGuide } from "@/hooks/useGuides";
import { Skeleton } from "@/components/ui/skeleton";

const GuideDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: guide, isLoading, error } = useGuide(slug || "");

  if (isLoading) {
    return (
      <Layout headerGradient="none">
        <div className="max-w-[640px] mx-auto px-4 py-12 space-y-4">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="w-full aspect-video rounded-[20px]" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout headerGradient="none">
        <ContentWrapper className="py-12">
          <div className="text-center py-12 rounded-lg border border-destructive/30">
            <h2 className="text-xl font-bold text-foreground mb-2">
              エラーが発生しました
            </h2>
            <p className="text-destructive text-sm">ガイド記事の読み込みに失敗しました</p>
          </div>
        </ContentWrapper>
      </Layout>
    );
  }

  if (!guide) {
    return <Navigate to="/guide" replace />;
  }

  return (
    <Layout headerGradient="none">
      {/* ヘッダー */}
      <div className="pt-2 pb-10">
        <GuideHeader guide={guide} />
      </div>

      {/* コンテンツ本文 */}
      {guide.content && guide.content.length > 0 && (
        <div className="px-4 pb-16">
          <GuideContent content={guide.content} />
        </div>
      )}
    </Layout>
  );
};

export default GuideDetailPage;
