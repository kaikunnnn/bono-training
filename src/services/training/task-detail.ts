
import { TaskDetailData } from "@/types/training";
import { getTrainingTaskDetail as fetchFromSanity } from "@/lib/sanity";
import { TrainingError } from "@/utils/errors";

/**
 * タスク詳細を取得（Sanityベース）
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  if (!trainingSlug || !taskSlug) {
    throw new TrainingError("トレーニングスラッグとタスクスラッグが必要です", "INVALID_REQUEST", 400);
  }

  try {
    const data = await fetchFromSanity(trainingSlug, taskSlug);

    if (!data) {
      throw new TrainingError("タスクが見つかりません", "NOT_FOUND", 404);
    }

    // 前後のタスクを算出
    const allTasks = data.allTasks || [];
    const currentIndex = allTasks.findIndex((t: any) => t.slug === taskSlug);
    const prevTask = currentIndex > 0 ? allTasks[currentIndex - 1].slug : null;
    const nextTask = currentIndex < allTasks.length - 1 ? allTasks[currentIndex + 1].slug : null;

    return {
      id: data._id,
      slug: data.slug,
      title: data.title,
      content: "", // Portable Textはsectionsで提供
      is_premium: data.isPremium || false,
      order_index: data.orderIndex ?? 1,
      training_id: data.training?._id || "",
      created_at: null,
      video_full: data.videoFull,
      video_preview: data.videoPreview,
      preview_sec: data.previewSec,
      trainingTitle: data.training?.title || "",
      trainingSlug: data.training?.slug || trainingSlug,
      trainingType: data.training?.type,
      next_task: nextTask,
      prev_task: prevTask,
      isPremiumCut: false,
      hasAccess: true,
      description: data.description,
      // Sanity Portable Text セクション
      sanitySections: data.sections || [],
    };
  } catch (err) {
    if (err instanceof TrainingError) throw err;
    console.error("getTrainingTaskDetail エラー:", err);
    throw new TrainingError("タスク詳細の取得中にエラーが発生しました", "UNKNOWN_ERROR");
  }
};
