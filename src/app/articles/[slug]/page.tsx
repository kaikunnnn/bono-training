import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleWithContext, getArticleMetadata, getAllArticles } from "@/lib/sanity";
import { getSubscriptionStatus, canAccessContent } from "@/lib/subscription";
import { isBookmarked } from "@/lib/services/bookmarks";
import { getArticleProgress } from "@/lib/services/progress";
import ArticleDetailClient from "./ArticleDetailClient";
import { ViewHistoryRecorder } from "@/components/article/ViewHistoryRecorder";
import VideoSection from "@/components/article/VideoSection";
import HeadingSection from "@/components/article/HeadingSection";
import TodoSection from "@/components/article/TodoSection";
import RichTextSection from "@/components/article/RichTextSection";
import ContentNavigation from "@/components/article/ContentNavigation";
import { ArticleActionButtons } from "@/components/article/ArticleActionButtons";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

// 認証状態に依存するため動的レンダリングを強制（ゲートUIの表示分岐に必要）
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await getAllArticles();
    return articles.map((article) => ({ slug: article.slug.current }));
  } catch {
    return [];
  }
}

// OGP用メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleMetadata(slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  const title = article.lessonTitle
    ? `${article.title} | ${article.lessonTitle} | BONO`
    : `${article.title} | BONO`;
  const description = article.excerpt || `${article.title}の学習コンテンツ`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: article.thumbnailUrl ? [{ url: article.thumbnailUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
    },
    alternates: { canonical: `/articles/${slug}` },
  };
}

// ページコンポーネント（Server Component）
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, subscription] = await Promise.all([
    getArticleWithContext(slug),
    getSubscriptionStatus(),
  ]);

  if (!article) {
    notFound();
  }

  // ブックマーク・完了状態を並列取得
  const [bookmarked, progressStatus] = await Promise.all([
    isBookmarked(article._id),
    getArticleProgress(article._id),
  ]);
  const isCompleted = progressStatus === "completed";
  const lessonId = article.lessonInfo?._id || "";

  // プレミアムコンテンツへのアクセス権限チェック
  const hasAccess = canAccessContent(article.isPremium || false, subscription.planType);

  // 前後の記事を計算（クエストをまたぐナビゲーション対応）
  const navigation = (() => {
    if (!article.lessonInfo?.quests) {
      return { previous: undefined, next: undefined };
    }

    // レッスン内の全記事をフラット化
    const allArticles: { slug: string; title: string; questId: string }[] = [];
    for (const quest of article.lessonInfo.quests) {
      for (const art of quest.articles) {
        allArticles.push({
          slug: art.slug.current,
          title: art.title,
          questId: quest._id,
        });
      }
    }

    const currentIndex = allArticles.findIndex(
      (a) => a.slug === article.slug.current
    );

    if (currentIndex === -1) {
      return { previous: undefined, next: undefined };
    }

    const previousArticle =
      currentIndex > 0
        ? {
            slug: allArticles[currentIndex - 1].slug,
            title: allArticles[currentIndex - 1].title,
          }
        : undefined;

    const nextArticle =
      currentIndex < allArticles.length - 1
        ? {
            slug: allArticles[currentIndex + 1].slug,
            title: allArticles[currentIndex + 1].title,
          }
        : undefined;

    return { previous: previousArticle, next: nextArticle };
  })();

  // 記事のインデックス番号を取得
  const articleIndex = article.questInfo?.articles
    ? article.questInfo.articles.findIndex((a) => a._id === article._id) + 1
    : undefined;

  return (
    <>
    <script
      {...jsonLdScriptProps(
        generateArticleJsonLd({
          title: article.title,
          description: article.excerpt || `${article.title}の学習コンテンツ`,
          url: `/articles/${slug}`,
          publishedAt: article.publishedAt || new Date().toISOString(),
          image: article.thumbnailUrl,
        })
      )}
    />
    <ArticleDetailClient article={article}>
      {/* 閲覧履歴を記録（プレミアムでロックされていない場合のみ） */}
      {hasAccess && <ViewHistoryRecorder articleId={article._id} />}

      {/* メインコンテンツエリア */}
      <main className="flex-1 min-w-0 flex flex-col items-center gap-4 pb-12">
        {/* Video Section */}
        <div className="w-full px-4 sm:px-6 md:px-0 min-[1680px]:px-2 min-[1680px]:pt-8 pt-16 md:pt-8">
          <VideoSection
            videoUrl={article.videoUrl}
            thumbnail={article.thumbnail}
            thumbnailUrl={article.thumbnailUrl}
            isPremium={article.isPremium}
            hasAccess={hasAccess}
            isLoggedIn={subscription.isLoggedIn}
          />
        </div>

        {/* 記事コンテンツ - 動画ブロックと同じ幅 */}
        <div className="w-full px-4 sm:px-6 md:px-0 py-0 min-[1680px]:px-2">
          <div className="flex flex-col gap-3">
            {/* Heading Section - 記事カード群の先頭へ移動 */}
            <HeadingSection
              tagType={article.articleType as "explain" | "intro" | "practice" | "challenge" | "demo" | undefined}
              title={article.title}
              description={article.excerpt}
              questInfo={
                article.questInfo
                  ? {
                      questNumber: article.questInfo.questNumber,
                      title: article.questInfo.title,
                    }
                  : undefined
              }
              articleIndex={articleIndex}
              articleId={article._id}
              lessonId={lessonId}
              isBookmarked={bookmarked}
              isCompleted={isCompleted}
              isPremium={article.isPremium}
            />

            {/* TODO Section - learningObjectives がある場合のみ表示 */}
            <TodoSection items={article.learningObjectives} />

            {/* Rich Text Section - 記事本文 */}
            {article.content && (
              <RichTextSection
                content={article.content}
                isPremium={article.isPremium}
                hasAccess={hasAccess}
                isLoggedIn={subscription.isLoggedIn}
                afterContent={
                  hasAccess && (
                    <ArticleActionButtons
                      articleId={article._id}
                      lessonId={lessonId}
                      title={article.title}
                      isBookmarked={bookmarked}
                      isCompleted={isCompleted}
                      isPremium={article.isPremium}
                    />
                  )
                }
              />
            )}

            {/* Content Navigation - 前後の記事へのナビゲーション */}
            <ContentNavigation
              previous={navigation.previous}
              next={navigation.next}
            />
          </div>
        </div>
      </main>
    </ArticleDetailClient>
    </>
  );
}
