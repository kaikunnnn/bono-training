import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

// ISR: 1時間キャッシュ
export const revalidate = 3600;
import { getAllFeedbacks, getFeedbacksByCategory, getFeedbackCategories } from "@/lib/sanity";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { CategoryTabs } from "@/components/feedback/CategoryTabs";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export const metadata: Metadata = {
  title: "フィードバック一覧",
  description: "BONOメンバーのデザインフィードバック事例。ポートフォリオやUIデザインへの具体的なアドバイスを公開しています。",
  openGraph: {
    title: "フィードバック一覧 | BONO",
    description: "BONOメンバーのデザインフィードバック事例。ポートフォリオやUIデザインへの具体的なアドバイスを公開しています。",
  },
  twitter: {
    title: "フィードバック一覧 | BONO",
    description: "BONOメンバーのデザインフィードバック事例。ポートフォリオやUIデザインへの具体的なアドバイスを公開しています。",
  },
  alternates: { canonical: "/feedbacks" },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

async function FeedbackList({ categorySlug }: { categorySlug?: string }) {
  const feedbacks = categorySlug
    ? await getFeedbacksByCategory(categorySlug)
    : await getAllFeedbacks();

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">フィードバックがありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {feedbacks.map((feedback) => (
        <FeedbackCard key={feedback._id} feedback={feedback} />
      ))}
    </div>
  );
}

async function CategoryTabsWrapper() {
  const [categories, allFeedbacks] = await Promise.all([
    getFeedbackCategories(),
    getAllFeedbacks(),
  ]);

  // カテゴリごとのカウントを計算
  const feedbackCounts: Record<string, number> = {};
  allFeedbacks.forEach((f) => {
    if (f.category?.slug?.current) {
      feedbackCounts[f.category.slug.current] =
        (feedbackCounts[f.category.slug.current] || 0) + 1;
    }
  });

  return (
    <CategoryTabs
      categories={categories}
      feedbackCounts={feedbackCounts}
      totalCount={allFeedbacks.length}
    />
  );
}

export default async function FeedbacksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <PageHeader
            label="Feedback"
            title="フィードバック一覧"
            description="BONOメンバーへの実際のフィードバック事例を公開しています。あなたのデザインの参考にしてください。"
          />
          <Button asChild className="flex-shrink-0">
            <Link href="/feedback-apply">
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              フィードバックを依頼
            </Link>
          </Button>
        </div>

        {/* カテゴリタブ */}
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="flex gap-2">
                <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
              </div>
            }
          >
            <CategoryTabsWrapper />
          </Suspense>
        </div>

        {/* フィードバック一覧 */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="h-24 bg-gray-200 animate-pulse" />
                  <div className="p-4 pt-8 space-y-3">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <FeedbackList categorySlug={categorySlug} />
        </Suspense>
      </div>
    </div>
  );
}
