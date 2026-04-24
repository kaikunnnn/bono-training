import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { getAllLessonsWithArticleIds } from "@/lib/sanity";
import { getBookmarkedArticles } from "@/lib/services/bookmarks";
import { getViewHistory } from "@/lib/services/viewHistory";
import {
  getMultipleLessonProgress,
  getMultipleLessonStatus,
} from "@/lib/services/progress";
import MyPageClient from "./MyPageClient";

export const metadata: Metadata = {
  title: "マイページ",
  description: "あなたの学習ダッシュボード",
};

export default async function MyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/mypage");
  }

  // データを並列取得
  const [lessons, bookmarkedArticles, viewHistory] = await Promise.all([
    getAllLessonsWithArticleIds(),
    getBookmarkedArticles(user.id),
    getViewHistory(user.id),
  ]);

  // レッスンの進捗を一括取得
  const lessonProgressInput = lessons.map((lesson) => ({
    lessonId: lesson._id,
    articleIds: lesson.articleIds || [],
  }));

  const [progressMap, statusMap] = await Promise.all([
    getMultipleLessonProgress(lessonProgressInput, user.id),
    getMultipleLessonStatus(
      lessons.map((l) => l._id),
      user.id
    ),
  ]);

  // レッスン + 進捗データを統合
  const lessonsWithProgress = lessons.map((lesson) => {
    const progress = progressMap[lesson._id] || null;
    const lessonStatus = statusMap[lesson._id] || "not_started";

    // 最初の未完了記事を特定
    let firstIncompleteArticle = null;
    if (lesson.quests && progress) {
      for (const quest of lesson.quests) {
        if (!quest.articles) continue;
        for (const article of quest.articles) {
          if (!progress.completedArticleIds.includes(article._id)) {
            firstIncompleteArticle = {
              title: article.title,
              slug: article.slug?.current || "",
            };
            break;
          }
        }
        if (firstIncompleteArticle) break;
      }
    }

    return {
      _id: lesson._id,
      title: lesson.title,
      slug: lesson.slug,
      iconImageUrl: lesson.iconImageUrl,
      progress,
      lessonStatus,
      firstIncompleteArticle,
    };
  });

  return (
    <MyPageClient
      bookmarkedArticles={bookmarkedArticles}
      viewHistory={viewHistory}
      lessonsWithProgress={lessonsWithProgress}
    />
  );
}
