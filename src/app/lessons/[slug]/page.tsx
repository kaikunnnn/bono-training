import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, getLessonMetadata } from "@/lib/sanity";
import { getLessonProgress } from "@/lib/services/progress";
import { getSubscriptionStatus, isContentLocked } from "@/lib/subscription";
import LessonDetailClient from "./LessonDetailClient";
import { generateCourseJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// OGP用メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonMetadata(slug);

  if (!lesson) {
    return {
      title: "レッスンが見つかりません",
    };
  }

  const title = `${lesson.seoTitle || lesson.title}`;
  const description = lesson.description || `${lesson.title}のレッスン内容を学習できます。`;
  const imageUrl = lesson.thumbnailUrl || lesson.iconImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: { canonical: `/lessons/${slug}` },
  };
}

// ページコンポーネント（Server Component）
export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const [lesson, subscription] = await Promise.all([
    getLesson(slug),
    getSubscriptionStatus(),
  ]);

  if (!lesson) {
    notFound();
  }

  // クエストごとの進捗マップを構築
  const questProgressMap: Record<string, { completed: number; total: number; completedArticleIds: string[] }> = {};
  let totalCompleted = 0;
  let totalArticles = 0;

  // 全クエストの記事IDを一括収集し、進捗を1回だけ取得（N+1 の直列待ちを回避）
  const allArticleIds = (lesson.quests || []).flatMap(
    (q) => q.articles?.map((a) => a._id) || []
  );
  const progress = await getLessonProgress(lesson._id, allArticleIds);
  const completedSet = new Set(progress.completedArticleIds);

  // クエストごとの内訳はローカルで計算（await なし）
  for (const quest of lesson.quests || []) {
    const qArticleIds = quest.articles?.map((a) => a._id) || [];
    const completedIds = qArticleIds.filter((id) => completedSet.has(id));

    questProgressMap[quest._id] = {
      completed: completedIds.length,
      total: qArticleIds.length,
      completedArticleIds: completedIds,
    };

    totalCompleted += completedIds.length;
    totalArticles += qArticleIds.length;
  }

  // 全体の進捗率を計算
  const overallProgress = totalArticles > 0
    ? Math.round((totalCompleted / totalArticles) * 100)
    : 0;

  // クエストに articleNumber と isLocked を付与
  const processedLesson = {
    ...lesson,
    quests: lesson.quests?.map((quest, questIndex) => ({
      ...quest,
      questNumber: quest.questNumber || questIndex + 1,
      articles: quest.articles?.map((article, articleIndex) => ({
        ...article,
        articleNumber: articleIndex + 1,
        isLocked: isContentLocked(article.isPremium || false, subscription.planType),
      })) || [],
    })) || [],
  };

  return (
    <>
      <script
        {...jsonLdScriptProps(
          generateCourseJsonLd({
            title: lesson.title,
            description: lesson.description || `${lesson.title}のレッスン内容を学習できます。`,
            url: `/lessons/${slug}`,
            image: lesson.thumbnailUrl || lesson.iconImageUrl,
          })
        )}
      />
      <LessonDetailClient
        lesson={processedLesson}
        progress={overallProgress}
        questProgressMap={questProgressMap}
      />
    </>
  );
}
