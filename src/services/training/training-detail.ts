
import { TrainingDetailData } from "@/types/training";
import { getTrainingDetail as fetchFromSanity } from "@/lib/sanity";
import { TrainingError } from "@/utils/errors";

/**
 * トレーニング詳細情報を取得（Sanityベース）
 */
export const getTrainingDetail = async (slug: string): Promise<TrainingDetailData> => {
  if (!slug || slug.trim() === "") {
    throw new TrainingError("トレーニングスラッグが指定されていません", "INVALID_REQUEST", 400);
  }

  try {
    const data = await fetchFromSanity(slug);

    if (!data) {
      throw new TrainingError("トレーニングが見つかりません", "NOT_FOUND", 404);
    }

    return {
      id: data._id,
      slug: data.slug,
      title: data.title,
      description: data.description || "",
      type: data.type || "challenge",
      difficulty: data.difficulty || "normal",
      tags: data.tags || [],
      tasks: (data.tasks || []).map((task: any) => ({
        id: task._id,
        training_id: data._id,
        slug: task.slug,
        title: task.title,
        order_index: task.orderIndex ?? 1,
        is_premium: task.isPremium || false,
        video_full: task.videoFull,
        video_preview: task.videoPreview,
        category: task.category,
        tags: task.tags || [],
        description: task.description,
      })),
      skills: data.skills,
      guide: data.guide,
      thumbnailImage: data.thumbnailUrl,
      iconImageUrl: data.iconImageUrl,
      backgroundSvg: data.backgroundSvg,
      fallbackGradient: data.fallbackGradient,
      estimatedTotalTime: data.estimatedTotalTime,
      has_premium_content: (data.tasks || []).some((t: any) => t.isPremium),
    };
  } catch (err) {
    if (err instanceof TrainingError) throw err;
    console.error("getTrainingDetail エラー:", err);
    throw new TrainingError("トレーニング詳細の取得中にエラーが発生しました", "UNKNOWN_ERROR");
  }
};
