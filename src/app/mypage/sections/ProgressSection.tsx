import { getMypageLessonsByIds } from "@/lib/sanity";
import { getMypageProgressSnapshot } from "@/lib/services/progress";
import { traceServerStep } from "@/lib/performance/server-trace";
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
  const snapshot = await traceServerStep("mypage.progress.snapshot", () =>
    getMypageProgressSnapshot(userId)
  );
  const activeLessonIds = new Set(
    snapshot.completedArticles
      .map((row) => row.lessonId)
      .filter((lessonId) => snapshot.lessonStatuses[lessonId] !== "completed")
  );
  const completedLessonIds = Object.entries(snapshot.lessonStatuses)
    .filter(([, status]) => status === "completed")
    .map(([lessonId]) => lessonId);
  const requestedIds = mode === "preview"
    ? [...activeLessonIds]
    : [...new Set([...activeLessonIds, ...completedLessonIds])];
  // unstable_cacheの引数を安定させ、同じ組み合わせのキャッシュを共有する。
  requestedIds.sort();

  const lessons = await traceServerStep("mypage.progress.cms", () =>
    getMypageLessonsByIds(requestedIds)
  );

  const completedByLesson = new Map<string, typeof snapshot.completedArticles>();
  for (const row of snapshot.completedArticles) {
    const rows = completedByLesson.get(row.lessonId) || [];
    rows.push(row);
    completedByLesson.set(row.lessonId, rows);
  }

  // レッスン + 進捗データを統合
  const lessonsWithProgress: LessonWithProgress[] = lessons.map((lesson) => {
    const completedRows = completedByLesson.get(lesson._id) || [];
    const completedIds = completedRows
      .map((row) => row.articleId)
      .filter((articleId) => lesson.articleIds.includes(articleId));
    const progress = {
      lessonId: lesson._id,
      totalArticles: lesson.articleIds.length,
      completedArticles: completedIds.length,
      percentage: lesson.articleIds.length > 0
        ? Math.round((completedIds.length / lesson.articleIds.length) * 100)
        : 0,
      completedArticleIds: completedIds,
      lastUpdatedAt: completedRows[0]?.updatedAt || null,
    };
    const lessonStatus = snapshot.lessonStatuses[lesson._id] || "not_started";

    let firstIncompleteArticle = null;
    if (lesson.quests) {
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
    return <ProgressPreview inProgressLessons={inProgressLessons.slice(0, 2)} />;
  }

  return (
    <ProgressFull
      inProgressLessons={inProgressLessons}
      completedLessons={completedLessons}
    />
  );
}
