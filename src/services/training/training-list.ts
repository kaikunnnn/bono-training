
import { Training } from "@/types/training";
import { getTrainings as fetchTrainingsFromSanity } from "@/lib/sanity";

/**
 * トレーニング一覧を取得（Sanityベース）
 */
export const getTrainings = async (): Promise<Training[]> => {
  try {
    const data = await fetchTrainingsFromSanity();

    return data.map((item: any) => ({
      id: item._id,
      slug: item.slug,
      title: item.title,
      description: item.description || "",
      type: item.type || "challenge",
      difficulty: item.difficulty || "normal",
      tags: item.tags || [],
      category: item.category,
      isPremium: item.isPremium || false,
      icon: item.iconImageUrl,
      thumbnailImage: item.thumbnailUrl,
      backgroundImage: item.backgroundSvg,
      estimated_total_time: item.estimatedTotalTime,
      task_count: item.task_count ?? 0,
      isFree: !item.isPremium,
    }));
  } catch (err) {
    console.error("getTrainings エラー:", err);
    return [];
  }
};
