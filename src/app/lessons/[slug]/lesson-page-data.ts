import "server-only";
import { getLesson } from "@/lib/sanity";
import { getLessonProgress } from "@/lib/services/progress";
import {
  getEffectiveLearningPlanType,
  getSubscriptionStatus,
  isContentLocked,
} from "@/lib/subscription";
import { traceServerStep } from "@/lib/performance/server-trace";
import type { SubscriptionState } from "@/types/subscription";

export type LessonPageLesson = NonNullable<
  Awaited<ReturnType<typeof getLesson>>
>;

export function startLessonPageData(slug: string) {
  const lessonPromise = traceServerStep("lesson.page.cms", () =>
    getLesson(slug)
  );
  const subscriptionPromise = traceServerStep(
    "lesson.page.subscription",
    getSubscriptionStatus,
  );

  return { lessonPromise, subscriptionPromise };
}

export function buildPublicLesson(lesson: LessonPageLesson) {
  return {
    ...lesson,
    quests:
      lesson.quests?.map((quest, questIndex) => ({
        ...quest,
        questNumber: quest.questNumber || questIndex + 1,
        articles:
          quest.articles?.map((article, articleIndex) => ({
            ...article,
            articleNumber: articleIndex + 1,
          })) || [],
      })) || [],
  };
}

export function startStandardLessonPresentation(
  lesson: LessonPageLesson,
  subscriptionPromise: Promise<SubscriptionState>,
) {
  const allArticleIds = (lesson.quests || []).flatMap(
    (quest) => quest.articles?.map((article) => article._id) || [],
  );
  const progressPromise = traceServerStep("lesson.page.progress", () =>
    getLessonProgress(lesson._id, allArticleIds)
  );

  return Promise.all([subscriptionPromise, progressPromise]).then(
    ([subscription, progress]) => {
      const effectivePlanType = getEffectiveLearningPlanType(
        subscription.planType,
        subscription.hasLearningAccess,
      );
      const completedSet = new Set(progress.completedArticleIds);
      const questProgressMap: Record<
        string,
        { completed: number; total: number; completedArticleIds: string[] }
      > = {};
      let totalCompleted = 0;
      let totalArticles = 0;

      for (const quest of lesson.quests || []) {
        const questArticleIds =
          quest.articles?.map((article) => article._id) || [];
        const completedArticleIds = questArticleIds.filter((articleId) =>
          completedSet.has(articleId)
        );

        questProgressMap[quest._id] = {
          completed: completedArticleIds.length,
          total: questArticleIds.length,
          completedArticleIds,
        };
        totalCompleted += completedArticleIds.length;
        totalArticles += questArticleIds.length;
      }

      const progressPercent =
        totalArticles > 0
          ? Math.round((totalCompleted / totalArticles) * 100)
          : 0;

      const processedLesson = {
        ...buildPublicLesson(lesson),
        quests:
          lesson.quests?.map((quest, questIndex) => ({
            ...quest,
            questNumber: quest.questNumber || questIndex + 1,
            articles:
              quest.articles?.map((article, articleIndex) => ({
                ...article,
                articleNumber: articleIndex + 1,
                isLocked: isContentLocked(
                  article.isPremium || false,
                  effectivePlanType,
                ),
              })) || [],
          })) || [],
      };

      return { processedLesson, progressPercent, questProgressMap };
    },
  );
}
