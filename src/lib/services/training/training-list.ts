import 'server-only'
import { createClient } from "@/lib/supabase/server";
import { getTrainingListFromSanity } from "@/lib/sanity";
import type { Training } from "@/types/training";

/**
 * トレーニング一覧を取得
 *
 * 3段階フォールバック:
 * 1. Edge Function（get-training-list）
 * 2. Sanity CMS 直接クエリ
 * 3. 空配列（ページをクラッシュさせない）
 */
export const getTrainings = async (): Promise<Training[]> => {
  // 1. Edge Function（第1段階）
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke("get-training-list", {
      body: {},
    });

    if (error) {
      throw error;
    }

    if (!data?.success || !data?.data) {
      throw new Error("レスポンス不正");
    }

    // Edge Functionから返るslugにもスペースが混入する可能性があるためtrim
    return (data.data as Training[]).map((t) => ({
      ...t,
      slug: (t.slug || "").trim(),
    }));
  } catch (edgeFnError) {
    console.warn("[getTrainings] Edge Function 失敗、Sanity フォールバックへ:", edgeFnError);

    // 2. Sanity CMS フォールバック（第2段階）
    try {
      const sanityData = await getTrainingListFromSanity();

      return sanityData.map((item) => ({
        id: item._id,
        slug: (item.slug || "").trim(),
        title: item.title,
        description: item.description || "",
        type: (item.type || "challenge") as Training["type"],
        difficulty: item.difficulty || "normal",
        tags: item.tags || [],
        category: item.category,
        icon: item.iconImageUrl,
        thumbnailImage: item.thumbnailUrl,
        backgroundImage: item.backgroundSvg,
        estimated_total_time: item.estimatedTotalTime,
        task_count: item.task_count ?? 0,
        isFree: !item.isPremium,
      }));
    } catch (sanityError) {
      console.error("[getTrainings] Sanity フォールバックも失敗:", sanityError);

      // 3. 空配列フォールバック（第3段階）— ページをクラッシュさせない
      return [];
    }
  }
};
