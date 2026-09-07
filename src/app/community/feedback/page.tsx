import { Metadata } from "next";
import {
  getAllFeedbacks,
  getFeedbacksByCategory,
  getFeedbackCategories,
} from "@/lib/sanity";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import CategoryNav from "@/components/common/CategoryNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "フィードバック",
  description:
    "BONOメンバーのデザインフィードバック事例。ポートフォリオやUIデザインへの具体的なアドバイスを公開しています。",
  openGraph: {
    title: "フィードバック | BONO",
    description:
      "BONOメンバーのデザインフィードバック事例。ポートフォリオやUIデザインへの具体的なアドバイスを公開しています。",
  },
  twitter: {
    title: "フィードバック | BONO",
    description:
      "BONOメンバーのデザインフィードバック事例。ポートフォリオやUIデザインへの具体的なアドバイスを公開しています。",
  },
  alternates: { canonical: "/community/feedback" },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CommunityFeedbackPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  const [categories, allFeedbacks] = await Promise.all([
    getFeedbackCategories(),
    getAllFeedbacks(),
  ]);

  const feedbacks = categorySlug
    ? await getFeedbacksByCategory(categorySlug)
    : allFeedbacks;

  const counts: Record<string, number> = {};
  allFeedbacks.forEach((f) => {
    const s = f.category?.slug?.current;
    if (s) counts[s] = (counts[s] || 0) + 1;
  });

  const categoryNavItems = [
    { label: "すべて", href: "/community/feedback", count: allFeedbacks.length },
    ...categories.map((cat) => ({
      label: cat.title,
      href: `/community/feedback?category=${cat.slug.current}`,
      count: counts[cat.slug.current] || 0,
    })),
  ];

  return (
    <div className="min-h-screen">
      {/* ヒーロー */}
      <section className="px-6 pt-16 pb-10 max-w-[1440px] mx-auto">
        <h1 className="text-4xl font-bold font-heading mb-4">
          フィードバック
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
          BONOメンバーへの実際のフィードバック事例を公開しています。あなたのデザインの参考にしてください。
        </p>
      </section>

      {/* カテゴリタブ */}
      <div className="px-6 max-w-[1440px] mx-auto">
        <CategoryNav items={categoryNavItems} />
      </div>

      {/* グリッド */}
      <section className="px-6 py-10 max-w-[1440px] mx-auto">
        {feedbacks.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            フィードバックがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbacks.map((feedback) => (
              <FeedbackCard key={feedback._id} feedback={feedback} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
