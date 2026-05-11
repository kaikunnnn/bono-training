/**
 * 完了レベル検知ロジック (Client Side)
 *
 * `completion-detection.ts` の Server Action 版を Client side で実行可能に書き換えたもの。
 * DB fetch を行わず、 props で渡された `completedArticleIds` を元に判定するため
 * Server Action の往復を待たずに即時判定できる。
 *
 * 使用例: ArticleDetailClient で楽観的に進捗を更新する際の completion level 判定
 */

export type CompletionLevel = "article" | "quest" | "lesson";

export interface CompletionDetectionResult {
  level: CompletionLevel;
  questTitle?: string;
  lessonTitle?: string;
}

interface DetectParams {
  /** 現在記事のクエストID */
  currentQuestId: string;
  /** 完了対象のレッスン情報 */
  quests: Array<{
    _id: string;
    title: string;
    articles: Array<{ _id: string }>;
  }>;
  /** 完了済み記事 ID 一覧（楽観的 update 後の状態を渡す） */
  completedArticleIds: string[];
  lessonTitle: string;
}

export function detectCompletionLevelClient(
  params: DetectParams
): CompletionDetectionResult {
  const { currentQuestId, quests, completedArticleIds, lessonTitle } = params;

  // 1. quest → articleIds マップ構築
  const allArticleIds: string[] = [];
  const questArticleMap: Record<string, string[]> = {};

  for (const quest of quests) {
    const ids = quest.articles.map((a) => a._id);
    allArticleIds.push(...ids);
    questArticleMap[quest._id] = ids;
  }

  // 2. 現在のクエスト内の完了状況チェック
  const questArticleIds = questArticleMap[currentQuestId];
  if (!questArticleIds) {
    return { level: "article" };
  }

  const completedInQuest = questArticleIds.filter((id) =>
    completedArticleIds.includes(id)
  );

  // 3. 完了レベル判定
  if (completedInQuest.length === questArticleIds.length) {
    // クエスト内の全記事が完了
    const completedInLesson = allArticleIds.filter((id) =>
      completedArticleIds.includes(id)
    );
    if (completedInLesson.length === allArticleIds.length) {
      // レッスン全体の全記事完了
      return { level: "lesson", lessonTitle };
    }
    // クエスト完了のみ
    const questTitle = quests.find((q) => q._id === currentQuestId)?.title || "";
    return { level: "quest", questTitle };
  }

  // 記事完了のみ
  return { level: "article" };
}

/**
 * lesson 全体の進捗 % を計算（Client side）
 */
export function calculateLessonProgress(
  quests: Array<{ articles: Array<{ _id: string }> }>,
  completedArticleIds: string[]
): { percentage: number; completedCount: number; totalCount: number } {
  const allArticleIds: string[] = [];
  for (const quest of quests) {
    allArticleIds.push(...quest.articles.map((a) => a._id));
  }
  const completedCount = allArticleIds.filter((id) =>
    completedArticleIds.includes(id)
  ).length;
  const totalCount = allArticleIds.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { percentage, completedCount, totalCount };
}
