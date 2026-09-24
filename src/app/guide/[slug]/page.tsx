import { Metadata } from "next";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGuideFromSanity,
  getGuidesByCategoryFromSanity,
} from "@/lib/sanity";
import { getSubscriptionStatus } from "@/lib/subscription";
import GuideHeader from "@/components/guide/GuideHeader";
import GuideContent from "@/components/guide/GuideContent";
import GuideShareSection from "@/components/guide/GuideShareSection";
import RelatedGuides from "@/components/guide/RelatedGuides";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";
import { guideSeoDescription } from "@/lib/seo/guideDescriptions";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideFromSanity(slug);

  if (!guide) {
    return { title: "ガイドが見つかりません" };
  }

  const ogImages = guide.thumbnailUrl
    ? [{ url: guide.thumbnailUrl, width: 1200, height: 630 }]
    : [];
  const description = guideSeoDescription(slug, guide.description);

  return {
    title: `${guide.title} | 読みもの`,
    description,
    openGraph: {
      ...OG_DEFAULTS,
      title: `${guide.title} | 読みもの`,
      description,
      type: "article",
      ...(ogImages.length > 0 && { images: ogImages }),
      ...(guide.publishedAt && { publishedTime: guide.publishedAt }),
      ...((guide.updatedAt || guide.sanityUpdatedAt) && {
        modifiedTime: guide.updatedAt || guide.sanityUpdatedAt,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | 読みもの`,
      description,
      ...(guide.thumbnailUrl && { images: [guide.thumbnailUrl] }),
    },
    alternates: { canonical: `/guide/${slug}` },
    robots: guide.isPremium ? { index: false, follow: true } : undefined,
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuideFromSanity(slug);

  if (!guide) {
    notFound();
  }

  const [subscription, relatedAll] = await Promise.all([
    getSubscriptionStatus(),
    getGuidesByCategoryFromSanity(guide.category),
  ]);
  const hasPremiumAccess = !guide.isPremium || subscription.hasMemberAccess;
  const relatedGuides = relatedAll
    .filter((g) => g.slug !== slug)
    .slice(0, 4);

  return (
    <>
      <script
        {...jsonLdScriptProps(
          generateArticleJsonLd({
            title: guide.title,
            description: guideSeoDescription(slug, guide.description) ?? "",
            url: `/guide/${slug}`,
            publishedAt: guide.publishedAt,
            modifiedAt: guide.updatedAt || guide.sanityUpdatedAt,
            author: guide.author,
          })
        )}
      />
      <div className="min-h-screen overflow-x-hidden">
        {/* ヘッダー */}
        <div className="pt-2 pb-10">
          <GuideHeader guide={guide} />
        </div>

        {/* コンテンツ本文 */}
        {hasPremiumAccess ? (
          guide.content && guide.content.length > 0 && (
            <div className="px-4 pb-16">
              <GuideContent content={guide.content} />

              {/* シェアセクション */}
              <div className="mt-12 px-4">
                <GuideShareSection title={guide.title} />
              </div>
            </div>
          )
        ) : (
          <div className="px-4 pb-16">
            <div className="max-w-[648px] mx-auto py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                プレミアムコンテンツ
              </h3>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                このガイドはプレミアムメンバー限定コンテンツです。
                メンバーになってすべてのコンテンツにアクセスしましょう。
              </p>
              <Button asChild>
                <Link href="/subscription">プランを見る</Link>
              </Button>
            </div>
          </div>
        )}

        {/* おすすめガイド */}
        <RelatedGuides guides={relatedGuides} />
      </div>
    </>
  );
}
