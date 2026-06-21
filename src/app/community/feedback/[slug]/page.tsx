import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getFeedback,
  getRelatedFeedbacks,
  getRecentFeedbacks,
  getAllFeedbackSlugs,
} from "@/lib/sanity";
import { getSubscriptionStatus, canAccessContent } from "@/lib/subscription";
import { getVideoInfo } from "@/lib/videoUtils";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import RichTextSection from "@/components/article/RichTextSection";
import PremiumVideoLock from "@/components/premium/PremiumVideoLock";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllFeedbackSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const feedback = await getFeedback(slug);

  if (!feedback) {
    return { title: "フィードバックが見つかりません" };
  }

  const description =
    feedback.excerpt || feedback.targetOutput || "BONOのデザインフィードバック";

  return {
    title: `${feedback.title} | フィードバック`,
    description,
    openGraph: {
      title: `${feedback.title} | フィードバック | BONO`,
      description,
    },
    twitter: {
      title: `${feedback.title} | フィードバック | BONO`,
      description,
    },
    alternates: { canonical: `/community/feedback/${slug}` },
  };
}

export default async function FeedbackDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [feedback, subscription] = await Promise.all([
    getFeedback(slug),
    getSubscriptionStatus(),
  ]);

  if (!feedback) {
    notFound();
  }

  const hasAccess = canAccessContent(true, subscription.planType);
  const isLoggedIn = subscription.isLoggedIn;
  const redirectTo = `/community/feedback/${slug}`;

  const categorySlug = feedback.category?.slug?.current;
  const [relatedFeedbacks, recentFeedbacks] = await Promise.all([
    categorySlug ? getRelatedFeedbacks(categorySlug, slug, 3) : Promise.resolve([]),
    getRecentFeedbacks(4, slug),
  ]);

  const formattedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const videoInfo = feedback.vimeoUrl ? getVideoInfo(feedback.vimeoUrl) : null;

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* パンくずリスト */}
        <div className="max-w-[1200px] mx-auto px-7 pt-8 pb-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/community/feedback">フィードバック</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {feedback.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{feedback.category.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* メインヘッダー */}
        <div className="flex flex-col items-center gap-8 px-4 pt-8 pb-0">
          <div className="flex flex-col items-start gap-3 w-full max-w-[648px] border-b border-black/[0.09] pb-[25px]">
            {/* タグバッジ */}
            <div className="inline-flex items-center justify-center rounded-full border border-text-secondary px-3 py-1">
              <span className="font-noto-sans-jp text-[11px] font-medium leading-4 text-text-secondary">
                フィードバック
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-[28px] md:text-[32px] font-bold text-left leading-[1.4] text-text-primary font-rounded-mplus break-words">
              {feedback.title}
            </h1>

            {/* ディスクリプション（excerpt優先、なければtargetOutput） */}
            {(feedback.excerpt || feedback.targetOutput) && (
              <p className="text-[14px] leading-[1.86] text-text-muted font-noto-sans-jp">
                {feedback.excerpt || feedback.targetOutput}
              </p>
            )}

            {/* メタ行: カテゴリ ・ 日付 */}
            {(feedback.category || formattedDate) && (
              <div className="flex items-center gap-[3px] text-text-muted font-noto-sans-jp">
                {feedback.category && (
                  <span className="text-[12px] font-bold">
                    {feedback.category.title}
                  </span>
                )}
                {feedback.category && formattedDate && (
                  <span className="text-[14px]">・</span>
                )}
                {formattedDate && (
                  <span className="text-[12px] font-bold">{formattedDate}</span>
                )}
              </div>
            )}
          </div>

          {/* ヒーローメディア: 動画があれば動画、なければスキップ */}
          {videoInfo && hasAccess && (
            <div className="w-full max-w-[648px]">
              <div className="w-full aspect-video rounded-3xl overflow-hidden bg-muted">
                <iframe
                  src={videoInfo.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={feedback.title}
                />
              </div>
            </div>
          )}
          {videoInfo && !hasAccess && (
            <div className="w-full max-w-[648px]">
              <PremiumVideoLock isLoggedIn={isLoggedIn} redirectTo={redirectTo} />
            </div>
          )}

          {/* アウトプット/リンク行 */}
          {(feedback.targetOutput || feedback.figmaUrl) && (
            <div className="w-full max-w-[648px] border-b border-black/[0.09] pb-8">
              <div className="flex flex-col gap-1 font-noto-sans-jp text-[14px] leading-[32.4px] text-text-muted">
                {feedback.targetOutput && (
                  <div className="flex flex-wrap gap-1">
                    <span>アウトプット：</span>
                    <span>{feedback.targetOutput}</span>
                  </div>
                )}
                {feedback.figmaUrl && (
                  <div className="flex flex-wrap gap-1">
                    <span>リンク :</span>
                    <a
                      href={feedback.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline break-all"
                    >
                      {feedback.figmaUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 本文 */}
        <div className="max-w-[720px] mx-auto px-6 py-12 flex flex-col gap-6">
          {/* フィードバック本文（プレミアム） */}
          {feedback.feedbackContent && feedback.feedbackContent.length > 0 && (
            <RichTextSection
              content={feedback.feedbackContent}
              isPremium
              hasAccess={hasAccess}
              isLoggedIn={isLoggedIn}
              redirectTo={redirectTo}
              previewBlockCount={3}
              bare
            />
          )}
        </div>

        {/* 関連フィードバック */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          {relatedFeedbacks.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
                関連フィードバック
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedFeedbacks.map((f) => (
                  <FeedbackCard key={f._id} feedback={f} />
                ))}
              </div>
            </section>
          )}

          {recentFeedbacks.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
                最近のフィードバック
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentFeedbacks.map((f) => (
                  <FeedbackCard key={f._id} feedback={f} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
