import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, getLessonMetadata, getAllLessonSlugs } from "@/lib/sanity";
import { getLessonProgress } from "@/lib/services/progress";
import { getSubscriptionStatus, isContentLocked } from "@/lib/subscription";
import LessonDetailClient from "./LessonDetailClient";
import { generateCourseJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllLessonSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
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

  const title = `${lesson.title} | BONO`;
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

  // 各クエストの進捗を取得
  for (const quest of lesson.quests || []) {
    const articleIds = quest.articles?.map(a => a._id) || [];
    const progress = await getLessonProgress(lesson._id, articleIds);

    questProgressMap[quest._id] = {
      completed: progress.completedArticles,
      total: progress.totalArticles,
      completedArticleIds: progress.completedArticleIds,
    };

    totalCompleted += progress.completedArticles;
    totalArticles += progress.totalArticles;
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
