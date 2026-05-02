import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getGuide, getAllGuideSlugs, getRelatedGuides } from "@/lib/guideLoader";
import { getCategoryInfo } from "@/lib/guideCategories";
import { getSubscriptionStatus } from "@/lib/subscription";
import { GuideCard } from "@/components/guide/GuideCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Lock,
  Briefcase,
  BookOpen,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const categoryIcons: Record<string, typeof Briefcase> = {
  career: Briefcase,
  learning: BookOpen,
  industry: TrendingUp,
  tools: Wrench,
};

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
  const categoryInfo = getCategoryInfo(guide.category);
  const Icon = categoryIcons[guide.category] || BookOpen;

  // プレミアムチェック
  const hasPremiumAccess =
    !guide.isPremium || subscription.hasMemberAccess;

  // 関連ガイドを取得
  const relatedGuides = guide.relatedGuides
    ? getRelatedGuides(guide.relatedGuides)
    : [];

  const formattedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

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
      <div className="max-w-[640px] mx-auto px-4 py-12">
        {/* 戻るリンク */}
        <Link
          href="/guide"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          ガイド一覧に戻る
        </Link>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {categoryInfo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {categoryInfo.label}
              </Badge>
            )}
            {guide.isPremium && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <Lock className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {guide.title}
          </h1>

          <p className="text-lg text-gray-600 mb-6">{guide.description}</p>

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {guide.author}
            </span>
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {guide.readingTime}
            </span>
          </div>

          {/* タグ */}
          {guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {guide.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* コンテンツ */}
        {hasPremiumAccess ? (
          <Card className="mb-8">
            <CardContent className="py-8 prose prose-gray max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mt-8 mb-4 text-text-primary">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2 text-text-primary">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mt-6 mb-3 text-text-primary">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-text-primary">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {children}
                      </code>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {guide.content || ""}
              </ReactMarkdown>
            </CardContent>
          </Card>
        ) : (
          /* プレミアムロック */
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                プレミアムコンテンツ
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                このガイドはプレミアムメンバー限定コンテンツです。
                メンバーになってすべてのコンテンツにアクセスしましょう。
              </p>
              <Button asChild>
                <Link href="/subscription">プランを見る</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 関連ガイド */}
        {relatedGuides.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">関連ガイド</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedGuides.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
}
