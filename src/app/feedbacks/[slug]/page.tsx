import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFeedback, getRelatedFeedbacks, getRecentFeedbacks, getAllFeedbackSlugs } from "@/lib/sanity";
import { getSubscriptionStatus } from "@/lib/subscription";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import PortableTextRenderer from "@/components/common/PortableTextRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Lock, Play } from "lucide-react";

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

  return {
    title: `${feedback.title} | フィードバック`,
    description: feedback.excerpt || feedback.targetOutput || "BONOのデザインフィードバック",
    openGraph: {
      title: `${feedback.title} | フィードバック | BONO`,
      description: feedback.excerpt || feedback.targetOutput || "BONOのデザインフィードバック",
    },
    twitter: {
      title: `${feedback.title} | フィードバック | BONO`,
      description: feedback.excerpt || feedback.targetOutput || "BONOのデザインフィードバック",
    },
    alternates: { canonical: `/feedbacks/${slug}` },
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

  // Standard/Feedback プランのみプレミアムコンテンツにアクセス可能
  const hasPremiumAccess =
    subscription.planType === "standard" || subscription.planType === "feedback";

  // 関連フィードバックと最近のフィードバックを取得
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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 戻るリンク */}
        <Link
          href="/feedbacks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          フィードバック一覧に戻る
        </Link>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {feedback.category && (
              <Badge variant="secondary" className="text-sm">
                {feedback.category.title}
              </Badge>
            )}
            {formattedDate && (
              <span className="text-sm text-gray-500">{formattedDate}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {feedback.title}
          </h1>
          {feedback.targetOutput && (
            <p className="text-lg text-gray-600">{feedback.targetOutput}</p>
          )}
        </div>

        {/* Figmaリンク（公開） */}
        {feedback.figmaUrl && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <a
                href={feedback.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Figmaでデザインを見る
              </a>
            </CardContent>
          </Card>
        )}

        {/* リクエスト内容（公開） */}
        {feedback.requestContent && feedback.requestContent.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">リクエスト内容</CardTitle>
            </CardHeader>
            <CardContent>
              <PortableTextRenderer value={feedback.requestContent} />
            </CardContent>
          </Card>
        )}

        {/* レビューポイント（公開） */}
        {feedback.reviewPoints && feedback.reviewPoints.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">レビューのポイント</CardTitle>
            </CardHeader>
            <CardContent>
              <PortableTextRenderer value={feedback.reviewPoints} />
            </CardContent>
          </Card>
        )}

        {/* プレミアムコンテンツ */}
        {hasPremiumAccess ? (
          <>
            {/* 動画レビュー */}
            {feedback.vimeoUrl && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    動画レビュー
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={feedback.vimeoUrl.replace("vimeo.com", "player.vimeo.com/video")}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="フィードバック動画"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* フィードバック本文 */}
            {feedback.feedbackContent && feedback.feedbackContent.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">フィードバック詳細</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <PortableTextRenderer value={feedback.feedbackContent} />
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* プレミアムロック */
          <Card className="mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10" />
            <CardContent className="py-12 relative z-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  プレミアムコンテンツ
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  動画レビューと詳細なフィードバックは、Standard・Feedbackプランのメンバー限定コンテンツです。
                </p>
                <Button asChild>
                  <Link href="/subscription">プランを見る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 関連フィードバック */}
        {relatedFeedbacks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              関連フィードバック
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedFeedbacks.map((f) => (
                <FeedbackCard key={f._id} feedback={f} />
              ))}
            </div>
          </section>
        )}

        {/* 最近のフィードバック */}
        {recentFeedbacks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
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
  );
}
