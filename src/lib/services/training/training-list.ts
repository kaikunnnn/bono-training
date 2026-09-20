import 'server-only'
import { createClient } from "@/lib/supabase/server";
import { getTrainingListFromSanity } from "@/lib/sanity";
import type { Training } from "@/types/training";

/**
 * トレーニング一覧を取得
 *
 * 3段階フォールバック:
 * 1. Sanity CMS 直接クエリ（CDN + Next キャッシュ）
 * 2. Edge Function（get-training-list）
 * 3. 空配列（ページをクラッシュさせない）
 */
export const getTrainings = async (): Promise<Training[]> => {
  // 1. 一覧の正本であるSanityを優先する。通常経路でcookies()とEdge Functionの
  //    ストレージ走査を避け、静的キャッシュから一覧を返せるようにする。
  try {
    const sanityData = await getTrainingListFromSanity();

    if (sanityData.length === 0) {
      throw new Error("Sanityのトレーニング一覧が空です");
    }

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
    console.warn("[getTrainings] Sanity 失敗、Edge Function フォールバックへ:", sanityError);

    // 2. Sanity障害時のみ、旧ストレージ由来のEdge Functionへフォールバックする。
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
      return (data.data as Training[]).map((training) => ({
        ...training,
        slug: (training.slug || "").trim(),
      }));
    } catch (edgeFnError) {
      console.error("[getTrainings] Edge Function フォールバックも失敗:", edgeFnError);

      // 3. 空配列フォールバック（第3段階）— ページをクラッシュさせない
      return [];
    }
  }
};
