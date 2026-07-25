import { getAllLessonsWithArticleIds } from "@/lib/sanity";
import {
  getMultipleLessonProgress,
  getMultipleLessonStatus,
} from "@/lib/services/progress";
import { ProgressPreview, ProgressFull } from "./ProgressSectionClient";
import type { LessonWithProgress } from "./ProgressSectionClient";

/**
 * Server Component: 進捗データ取得 + Client へ受け渡し
 * mode に応じて preview / full を切り替える
 */
export async function ProgressSection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  const lessons = await getAllLessonsWithArticleIds();

  const lessonProgressInput = lessons.map((lesson) => ({
    lessonId: lesson._id,
    articleIds: lesson.articleIds || [],
  }));

  const [progressMap, statusMap] = await Promise.all([
    getMultipleLessonProgress(lessonProgressInput, userId),
    getMultipleLessonStatus(
      lessons.map((l) => l._id),
      userId
    ),
  ]);

  // レッスン + 進捗データを統合
  const lessonsWithProgress: LessonWithProgress[] = lessons.map((lesson) => {
    const progress = progressMap[lesson._id] || null;
    const lessonStatus = statusMap[lesson._id] || "not_started";

    let firstIncompleteArticle = null;
    if (lesson.quests) {
      const completedIds = progress?.completedArticleIds || [];
      for (const quest of lesson.quests) {
        if (!quest.articles) continue;
        for (const article of quest.articles) {
          if (!completedIds.includes(article._id)) {
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

  const inProgressLessons = lessonsWithProgress.filter(
    (l) => l.progress && l.progress.percentage > 0 && l.lessonStatus !== "completed"
  );
  const completedLessons = lessonsWithProgress.filter(
    (l) => l.lessonStatus === "completed"
  );

  if (mode === "preview") {
    return <ProgressPreview inProgressLessons={inProgressLessons} />;
  }

  return (
    <ProgressFull
      inProgressLessons={inProgressLessons}
      completedLessons={completedLessons}
    />
  );
}
