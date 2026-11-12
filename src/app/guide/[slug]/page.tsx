import { Metadata } from "next";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
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
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/jsonld";
import { getCategoryInfo } from "@/lib/guideCategories";
import { guideSeoDescription } from "@/lib/seo/guideDescriptions";
import { getGuideSeoOverride } from "@/lib/guide-seo";
import { PricingCtaLink } from "@/components/analytics/PricingCtaLink";
import { RoadmapEndBlock } from "@/components/guide-promo/RoadmapEndBlock";
import { RoadmapInlineBlock } from "@/components/guide-promo/RoadmapInlineBlock";
import { findInsertIndexAfterKey } from "@/lib/guide-inline-position";
import {
  GUIDE_INLINE_BLOCKS,
  getGuideRoadmapSlug,
  guidePromoHeading,
  resolvePromo,
} from "@/lib/guide-roadmap-map";
import { getPromoRoadmaps } from "@/lib/guide-promo-data";

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
  // rebono#24: 検索向けに文言を決めたガイドはコード側の値で上書きする（Sanityは変更しない）
  const seo = getGuideSeoOverride(slug);
  const description =
    seo?.description ?? guideSeoDescription(slug, guide.description);
  const metaTitle = seo?.title ?? `${guide.title} | 読みもの`;

  return {
    // 上書き文言は「| BONO」を含むため root の title.template を付けない
    title: seo ? { absolute: seo.title } : metaTitle,
    description,
    openGraph: {
      ...OG_DEFAULTS,
      title: metaTitle,
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
      title: metaTitle,
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

  // #280 紹介ブロックのロードマップ（出さない指定のガイドは取得しない）
  const promoRoadmapSlug = getGuideRoadmapSlug(slug);
  const [subscription, relatedAll, promoRoadmaps] = await Promise.all([
    getSubscriptionStatus(),
    getGuidesByCategoryFromSanity(guide.category),
    promoRoadmapSlug ? getPromoRoadmaps() : Promise.resolve([]),
  ]);
  const hasPremiumAccess = !guide.isPremium || subscription.hasMemberAccess;
  const relatedGuides = relatedAll
    .filter((g) => g.slug !== slug)
    .slice(0, 4);

  // #280 課金中でない人だけ・本文が見えているときだけ（会員限定のロック画面には出さない）
  const promoRoadmap = hasPremiumAccess
    ? resolvePromo({
        roadmapSlug: promoRoadmapSlug,
        hasMemberAccess: subscription.hasMemberAccess,
        roadmaps: promoRoadmaps,
      })
    : null;
  const promoTracking = { pageType: "guide" as const, pageSlug: slug };

  // #280 本文中ブロック: 学ぶ順番の話をしている記事だけ、決めた段落のすぐ後ろに出す
  const inlineBlock = promoRoadmap ? GUIDE_INLINE_BLOCKS[slug] : undefined;
  const inlineIndex = inlineBlock ? findInsertIndexAfterKey(guide.content, inlineBlock.afterKey) : null;
  if (inlineBlock && inlineIndex === null) {
    console.error("[guide-promo] inline block anchor not found", { slug, afterKey: inlineBlock.afterKey });
  }

  return (
    <>
      {/* #236 パンくず: 画面上のパンくず（GuideHeader）と同じ ガイド → カテゴリ → 記事 */}
      <script
        {...jsonLdScriptProps(
          generateBreadcrumbJsonLd([
            { name: "ガイド", url: "/guide" },
            {
              name: getCategoryInfo(guide.category)?.label ?? guide.category,
              url: `/guide?category=${guide.category}`,
            },
            { name: guide.title },
          ])
        )}
      />
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
              <GuideContent
                content={guide.content}
                insertBefore={
                  promoRoadmap && inlineBlock && inlineIndex !== null
                    ? {
                        index: inlineIndex,
                        node: (
                          <RoadmapInlineBlock
                            block={inlineBlock}
                            roadmap={promoRoadmap}
                            tracking={promoTracking}
                            className="my-12"
                          />
                        ),
                      }
                    : undefined
                }
              />

              {/* #280 記事の最後の BONO 紹介（シェアより上・オーナー指定） */}
              {promoRoadmap && (
                <RoadmapEndBlock
                  heading={guidePromoHeading(promoRoadmap)}
                  roadmap={promoRoadmap}
                  tracking={promoTracking}
                  className="mx-auto mt-16 w-full max-w-[648px]"
                />
              )}

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
                <PricingCtaLink group="other">プランを見る</PricingCtaLink>
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
