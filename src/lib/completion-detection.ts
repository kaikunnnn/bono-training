/**
 * 完了レベル検知ロジック
 * 記事完了後にクエスト完了・レッスン完了を判定する
 */
import { getLessonProgress, markLessonAsCompleted } from '@/lib/services/progress';

export type CompletionLevel = 'article' | 'quest' | 'lesson';

export interface CompletionDetectionResult {
  level: CompletionLevel;
  questTitle?: string;
  lessonTitle?: string;
}

interface DetectParams {
  currentQuestId: string;
  lessonId: string;
  quests: Array<{
    _id: string;
    title: string;
    articles: Array<{ _id: string }>;
  }>;
  lessonTitle: string;
}

export async function detectCompletionLevel(
  params: DetectParams
): Promise<CompletionDetectionResult> {
  const { currentQuestId, lessonId, quests, lessonTitle } = params;

  // 1. quest → articleIds マップ構築
  const allArticleIds: string[] = [];
  const questArticleMap: Record<string, string[]> = {};

  for (const quest of quests) {
    const ids = quest.articles.map((a) => a._id);
    allArticleIds.push(...ids);
    questArticleMap[quest._id] = ids;
  }

  // 2. 最新の進捗を取得
  const progress = await getLessonProgress(lessonId, allArticleIds);

  // 3. 現在のクエスト内の完了状況チェック
  const questArticleIds = questArticleMap[currentQuestId];
  if (!questArticleIds) {
    return { level: 'article' };
  }

  const completedInQuest = questArticleIds.filter((id) =>
    progress.completedArticleIds.includes(id)
  );

  // 4. 完了レベル判定
  if (completedInQuest.length === questArticleIds.length) {
    // クエスト内の全記事が完了
    if (progress.percentage === 100) {
      // レッスン全体完了
      await markLessonAsCompleted(lessonId);
      return { level: 'lesson', lessonTitle };
    }
    // クエスト完了のみ
    const questTitle = quests.find((q) => q._id === currentQuestId)?.title || '';
    return { level: 'quest', questTitle };
  }

  // 記事完了のみ
  return { level: 'article' };
}
