import { Metadata } from "next";
import { Suspense } from "react";
import { getArticleMetadata } from "@/lib/sanity";
import { redirectMissingContent } from "@/lib/missingContentRedirect";
import {
  canAccessContent,
  getEffectiveLearningPlanType,
} from "@/lib/subscription";
import { ViewHistoryRecorder } from "@/components/article/ViewHistoryRecorder";
import VideoSection from "@/components/article/VideoSection";
import HeadingSection from "@/components/article/HeadingSection";
import TodoSection from "@/components/article/TodoSection";
import RichTextSection from "@/components/article/RichTextSection";
import ContentNavigation from "@/components/article/ContentNavigation";
import { ArticleActionButtons } from "@/components/article/ArticleActionButtons";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";
import { OG_DEFAULTS, DEFAULT_OG_IMAGE } from "@/lib/seo-metadata";
import { getProductionContentSlugs } from "@/lib/productionContentSlugs";
import { traceServerStep } from "@/lib/performance/server-trace";
import { startArticlePageData } from "./article-page-data";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArticleWithContext } from "@/types/sanity";
import type { SubscriptionState } from "@/types/subscription";

// ISR: 1時間キャッシュ（ユーザー固有データはクライアント側で取得）
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

type ArticlePageDataPromise = ReturnType<
  typeof startArticlePageData
>["dataPromise"];

function canViewArticle(
  article: ArticleWithContext,
  subscription: SubscriptionState,
) {
  const effectivePlanType = getEffectiveLearningPlanType(
    subscription.planType,
    subscription.hasLearningAccess,
  );

  return canAccessContent(article.isPremium || false, effectivePlanType);
}

async function PersonalizedVideo({
  article,
  slug,
  dataPromise,
}: {
  article: ArticleWithContext;
  slug: string;
  dataPromise: ArticlePageDataPromise;
}) {
  const { subscription } = await dataPromise;
  const hasAccess = canViewArticle(article, subscription);

  return (
    <>
      {hasAccess && <ViewHistoryRecorder articleId={article._id} />}
      <VideoSection
        videoUrl={article.videoUrl}
        thumbnail={article.thumbnail}
        thumbnailUrl={article.thumbnailUrl}
        isPremium={article.isPremium}
        hasAccess={hasAccess}
        isLoggedIn={subscription.isLoggedIn}
        redirectTo={`/contents/${slug}`}
      />
    </>
  );
}

async function PersonalizedArticleActions({
  article,
  lessonId,
  dataPromise,
}: {
  article: ArticleWithContext;
  lessonId: string;
  dataPromise: ArticlePageDataPromise;
}) {
  const { bookmarked, progressStatus } = await dataPromise;

  return (
    <ArticleActionButtons
      articleId={article._id}
      lessonId={lessonId}
      title={article.title}
      isBookmarked={bookmarked}
      isCompleted={progressStatus === "completed"}
      isPremium={article.isPremium}
    />
  );
}

async function PersonalizedArticleBody({
  article,
  slug,
  lessonId,
  dataPromise,
  navigation,
}: {
  article: ArticleWithContext;
  slug: string;
  lessonId: string;
  dataPromise: ArticlePageDataPromise;
  navigation: {
    previous?: { slug: string; title: string };
    next?: { slug: string; title: string };
  };
}) {
  const { subscription, bookmarked, progressStatus } = await dataPromise;
  const hasAccess = canViewArticle(article, subscription);

  return (
    <>
      {article.content && (
        <RichTextSection
          content={article.content}
          isPremium={article.isPremium}
          hasAccess={hasAccess}
          isLoggedIn={subscription.isLoggedIn}
          redirectTo={`/contents/${slug}`}
          afterContent={
            hasAccess && (
              <ArticleActionButtons
                articleId={article._id}
                lessonId={lessonId}
                title={article.title}
                isBookmarked={bookmarked}
                isCompleted={progressStatus === "completed"}
                isPremium={article.isPremium}
              />
            )
          }
        />
      )}
      <ContentNavigation
        previous={navigation.previous}
        next={navigation.next}
      />
    </>
  );
}

function ArticleActionsFallback() {
  return (
    <div
      className="w-full py-2 flex flex-col gap-3 items-start md:flex-row md:gap-0 md:justify-between"
      aria-label="記事の操作を読み込み中"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-2xl" />
        <Skeleton className="h-9 w-28 rounded-2xl" />
        <Skeleton className="h-9 w-10 sm:w-24 rounded-2xl" />
      </div>
      <Skeleton className="h-9 w-10 sm:w-20 rounded-2xl" />
    </div>
  );
}

function ArticleBodyFallback() {
  return (
    <div
      className="w-full rounded-[20px] bg-white px-6 py-8 space-y-4"
      aria-label="記事本文を読み込み中"
    >
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

// OGP用メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await traceServerStep("article.metadata.cms", () =>
    getArticleMetadata(slug)
  );

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  const title = article.lessonTitle
    ? `${article.title} | ${article.lessonTitle}`
    : `${article.title}`;
  const description = article.excerpt || `${article.title}の学習コンテンツ`;

  // サイト移行 Week1 / SEO止血:
  // Webflow 本番（www.bo-no.design）に同一 slug の記事が存在する場合、
  // canonical を本番の絶対 URL に向けて重複評価を本番へ集約する。
  // 本番に無いベータ独自記事は従来通り自己 canonical（相対パス）のまま。
  // metadataBase 設定に依存させないため、cross-domain 側は絶対 URL を指定する。
  const productionSlugs = await traceServerStep(
    "article.metadata.production_slugs",
    getProductionContentSlugs,
  );
  const canonical = productionSlugs.has(slug)
    ? `https://www.bo-no.design/contents/${slug}`
    : `/contents/${slug}`;

  return {
    title,
    description,
    openGraph: {
      ...OG_DEFAULTS,
      title,
      description,
      type: "article",
      // サムネ未設定時は root の既定 OGP にフォールバック（og:image を消さない）
      images: article.thumbnailUrl
        ? [{ url: article.thumbnailUrl, width: 1200, height: 630 }]
        : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : [DEFAULT_OG_IMAGE],
    },
    alternates: { canonical },
  };
}

// ページコンポーネント（Server Component）
// サイドナビは layout.tsx 側で描画される（記事間遷移時の保持のため）
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const articleRequest = startArticlePageData(slug);
  const article = await articleRequest.articlePromise;

  if (!article) {
    // 記事が Sanity に無い場合: 本番 Webflow に存在すれば legacy へリダイレクト、
    // 無ければ notFound()（redirectMissingContent が両分岐を throw で処理する）。
    // return で抜けることで、以降 article が non-null に型で絞り込まれる。
    return await redirectMissingContent(slug);
  }

  const lessonId = article.lessonInfo?._id || "";

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
            url: `/contents/${slug}`,
            publishedAt: article.publishedAt || new Date().toISOString(),
            image: article.thumbnailUrl,
          })
        )}
      />

      {/* メインコンテンツエリア */}
      <main className="flex-1 min-w-0 flex flex-col items-center gap-4 pb-12">
        {/* Video Section */}
        <div className="w-full px-4 sm:px-6 md:px-0 min-[1680px]:px-2 min-[1680px]:pt-8 pt-16 md:pt-8">
          <Suspense
            fallback={<Skeleton className="w-full aspect-video rounded-2xl" />}
          >
            <PersonalizedVideo
              article={article}
              slug={slug}
              dataPromise={articleRequest.dataPromise}
            />
          </Suspense>
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
              isPremium={article.isPremium}
              actions={
                <Suspense fallback={<ArticleActionsFallback />}>
                  <PersonalizedArticleActions
                    article={article}
                    lessonId={lessonId}
                    dataPromise={articleRequest.dataPromise}
                  />
                </Suspense>
              }
            />

            {/* TODO Section - learningObjectives がある場合のみ表示 */}
            <TodoSection items={article.learningObjectives} />

            {/* Rich Text Section + navigation: 後続要素の押し下げを防ぐ */}
            <Suspense fallback={<ArticleBodyFallback />}>
              <PersonalizedArticleBody
                article={article}
                slug={slug}
                lessonId={lessonId}
                dataPromise={articleRequest.dataPromise}
                navigation={navigation}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
