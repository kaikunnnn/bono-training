import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGuide, getAllGuideSlugs, getRelatedGuides } from "@/lib/guideLoader";
import { getSubscriptionStatus } from "@/lib/subscription";

// ISR: 1時間キャッシュ
export const revalidate = 3600;
import GuideHeader from "@/components/guide/GuideHeader";
import GuideContent from "@/components/guide/GuideContent";
import RelatedGuides from "@/components/guide/RelatedGuides";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return { title: "ガイドが見つかりません" };
  }

  const title = guide.seo?.title || guide.title;
  const description = guide.seo?.description || guide.description;

  return {
    title: `${title} | ガイド`,
    description,
    openGraph: {
      title: `${title} | ガイド | BONO`,
      description,
    },
    twitter: {
      title: `${title} | ガイド | BONO`,
      description,
    },
    alternates: { canonical: `/guide/${slug}` },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  const subscription = await getSubscriptionStatus();

  // プレミアムチェック
  const hasPremiumAccess =
    !guide.isPremium || subscription.hasMemberAccess;

  // 関連ガイドを取得
  const relatedGuides = guide.relatedGuides
    ? getRelatedGuides(guide.relatedGuides)
    : [];

  return (
    <>
      <script
        {...jsonLdScriptProps(
          generateArticleJsonLd({
            title: guide.title,
            description: guide.description,
            url: `/guide/${slug}`,
            publishedAt: guide.publishedAt,
            modifiedAt: guide.updatedAt,
            author: guide.author,
          })
        )}
      />
      <div className="min-h-screen">
        {/* ヘッダー */}
        <div className="pt-2 pb-10">
          <GuideHeader guide={guide} />
        </div>

        {/* コンテンツ本文 */}
        {hasPremiumAccess ? (
          guide.content && guide.content.length > 0 && (
            <div className="px-4 pb-16">
              <GuideContent content={guide.content} />
            </div>
          )
        ) : (
          /* プレミアムロック */
          <div className="px-4 pb-16">
            <div className="max-w-[640px] mx-auto py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                プレミアムコンテンツ
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                このガイドはプレミアムメンバー限定コンテンツです。
                メンバーになってすべてのコンテンツにアクセスしましょう。
              </p>
              <Button asChild>
                <Link href="/subscription">プランを見る</Link>
              </Button>
            </div>
          </div>
        )}

        {/* 関連ガイド */}
        <RelatedGuides guides={relatedGuides} />
      </div>
    </>
  );
}
