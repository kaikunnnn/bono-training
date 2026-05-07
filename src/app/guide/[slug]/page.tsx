import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getGuideFromSanity, getAllGuideSlugsFromSanity } from "@/lib/sanity";
import { getSubscriptionStatus } from "@/lib/subscription";
import GuideHeader from "@/components/guide/GuideHeader";
import GuideContent from "@/components/guide/GuideContent";
import DottedDivider from "@/components/common/DottedDivider";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";
import {
  getTopicBySlug,
  getThemeBySlug,
  getTopicsByTheme,
  getAllTopics,
} from "../data";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Sanity記事 + ダミートピック両方のslugを返す
  const sanitySlug = await getAllGuideSlugsFromSanity();
  const topicSlugs = getAllTopics().map((t) => t.slug);
  const allSlugs = [...new Set([...sanitySlug, ...topicSlugs])];
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // ダミートピックを先にチェック
  const topic = getTopicBySlug(slug);
  if (topic) {
    const theme = getThemeBySlug(topic.themeSlug);
    return {
      title: `${topic.title} | ${theme?.title || "ガイド"}`,
      description: topic.description,
    };
  }

  // Sanity記事
  const guide = await getGuideFromSanity(slug);
  if (!guide) {
    return { title: "ガイドが見つかりません" };
  }

  return {
    title: `${guide.title} | ガイド`,
    description: guide.description,
  };
}

/** ダミートピックの記事詳細 */
function TopicDetailPage({
  topic,
  themeName,
  relatedTopics,
}: {
  topic: ReturnType<typeof getTopicBySlug>;
  themeName: string;
  relatedTopics: ReturnType<typeof getTopicsByTheme>;
}) {
  if (!topic) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-[740px] mx-auto px-4 sm:px-6">
        {/* パンくず */}
        <div className="pt-8 pb-4">
          <nav className="flex items-center gap-1.5 text-sm text-text-muted font-noto-sans-jp">
            <Link href="/guide" className="hover:text-text-link transition-colors">
              ガイド
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-disabled">{themeName}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary">{topic.title}</span>
          </nav>
        </div>

        {/* ヘッダー */}
        <div className="flex flex-col items-center gap-5 pt-8 pb-12">
          <p className="text-xs font-medium text-text-muted">{themeName}</p>
          <h1
            className="text-[32px] sm:text-[41px] font-bold text-center leading-[1.5] text-text-primary font-rounded-mplus"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {topic.title}
          </h1>
          <p className="text-base text-text-muted text-center max-w-[560px] font-noto-sans-jp">
            {topic.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-text-disabled">
            <span className="font-medium text-text-primary text-[13px]">BONO</span>
            <span>・</span>
            <span className="text-[14px]">2026/5/7</span>
          </div>
        </div>

        {/* ダミー本文 */}
        <div className="pb-12 [&>*+*]:mt-[30px]">
          <p className="text-[15px] leading-[26px] text-foreground/80">
            この記事では「{topic.title}」について体系的に解説します。デザインを学ぶ上で重要なポイントを、実践的な視点からまとめました。
          </p>

          <h2 className="text-lg font-bold leading-8 text-text-primary border-b border-border-light pb-2">
            はじめに
          </h2>
          <p className="text-[15px] leading-[26px] text-foreground/80">
            {topic.description}
          </p>
          <p className="text-[15px] leading-[26px] text-foreground/80">
            この記事はプロトタイプのダミーコンテンツです。実際の記事では、より詳しい解説やビジュアル、実例を交えて説明していきます。
          </p>

          <h2 className="text-lg font-bold leading-8 text-text-primary border-b border-border-light pb-2">
            ポイント
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-1.5">
            <li className="text-[15px] leading-6 text-foreground/80">実際のプロジェクトでの活用方法</li>
            <li className="text-[15px] leading-6 text-foreground/80">よくある間違いとその対処法</li>
            <li className="text-[15px] leading-6 text-foreground/80">プロが実践している効率的な進め方</li>
          </ul>

          <h2 className="text-lg font-bold leading-8 text-text-primary border-b border-border-light pb-2">
            まとめ
          </h2>
          <p className="text-[15px] leading-[26px] text-foreground/80">
            「{topic.title}」は、デザイナーとしてのスキルアップに欠かせない知識です。この記事で紹介した内容を参考に、ぜひ実践してみてください。
          </p>
        </div>

        {/* 関連トピック */}
        {relatedTopics.length > 0 && (
          <>
            <DottedDivider className="mb-8" />
            <div className="pb-16">
              <h2 className="text-lg font-bold font-rounded-mplus text-text-primary mb-6">
                {themeName}の他の記事
              </h2>
              <div className="flex flex-col">
                {relatedTopics
                  .filter((t) => t.slug !== topic.slug)
                  .map((t, i) => (
                    <Link
                      key={t.slug}
                      href={`/guide/${t.slug}`}
                      className="flex items-center gap-3 py-3.5 border-b border-border-light last:border-b-0 group"
                    >
                      <span className="text-xs font-bold text-text-disabled w-5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[15px] font-bold text-text-primary font-noto-sans-jp group-hover:text-text-link transition-colors">
                        {t.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
                    </Link>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. ダミートピックをチェック
  const topic = getTopicBySlug(slug);
  if (topic) {
    const theme = getThemeBySlug(topic.themeSlug);
    const relatedTopics = getTopicsByTheme(topic.themeSlug);
    return (
      <TopicDetailPage
        topic={topic}
        themeName={theme?.title || ""}
        relatedTopics={relatedTopics}
      />
    );
  }

  // 2. Sanity記事
  const guide = await getGuideFromSanity(slug);
  if (!guide) {
    notFound();
  }

  const subscription = await getSubscriptionStatus();
  const hasPremiumAccess = !guide.isPremium || subscription.hasMemberAccess;

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
        <div className="pt-2 pb-10">
          <GuideHeader guide={guide} />
        </div>

        {hasPremiumAccess ? (
          guide.content && guide.content.length > 0 && (
            <div className="px-4 pb-16">
              <GuideContent content={guide.content} />
            </div>
          )
        ) : (
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
              </p>
              <Button asChild>
                <Link href="/subscription">プランを見る</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
