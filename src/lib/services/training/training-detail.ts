import 'server-only'
import { createClient } from "@/lib/supabase/server";
import { getTrainingDetailFromSanity } from "@/lib/sanity";
import type { TrainingDetailData } from "@/types/training";
import { TrainingError } from "@/lib/errors";

/**
 * トレーニング詳細情報を取得（Storageベース）
 *
 * 3段階フォールバック:
 * 1. Edge Function（get-training-detail）
 * 2. Sanity CMS 直接クエリ
 * 3. TrainingError をスロー（呼び出し元で notFound() 処理）
 */
export const getTrainingDetail = async (
  slug: string
): Promise<TrainingDetailData> => {
  if (!slug || slug.trim() === "") {
    throw new TrainingError(
      "トレーニングスラッグが指定されていません",
      "INVALID_REQUEST",
      400
    );
  }

  const normalizedSlug = slug.trim();

  // 1. Edge Function（第1段階）
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "get-training-detail",
      {
        body: { slug: normalizedSlug },
      }
    );

    if (error) {
      console.error("[getTrainingDetail] Edge Function エラー:", error);
      throw error;
    }

    if (!data?.success || !data?.data) {
      console.error("[getTrainingDetail] Edge Function レスポンス不正:", data);
      throw new Error("レスポンス不正");
    }

    return data.data as TrainingDetailData;
  } catch (edgeFnError) {
    console.warn("[getTrainingDetail] Edge Function 失敗、Sanity フォールバックへ:", edgeFnError);

    // 2. Sanity CMS フォールバック（第2段階）
    try {
      console.log("[getTrainingDetail] Sanity フォールバック開始 slug:", normalizedSlug);
      const sanityData = await getTrainingDetailFromSanity(normalizedSlug);

      if (!sanityData) {
        console.warn("[getTrainingDetail] Sanity クエリ結果が null。slug:", normalizedSlug);
        throw new TrainingError(
          "トレーニングが見つかりません",
          "NOT_FOUND",
          404
        );
      }

      console.log("[getTrainingDetail] Sanity フォールバック成功:", sanityData.title);

      return {
        id: sanityData._id,
        slug: sanityData.slug,
        title: sanityData.title,
        description: sanityData.description || "",
        type: sanityData.type || "challenge",
        difficulty: sanityData.difficulty || "normal",
        tags: sanityData.tags || [],
        icon: sanityData.iconImageUrl,
        thumbnailImage: sanityData.thumbnailUrl,
        background_svg: sanityData.backgroundSvg,
        category: sanityData.category,
        tasks: (sanityData.tasks || []).map((task, index) => ({
          id: task._id,
          training_id: sanityData._id,
          slug: task.slug,
          title: task.title,
          order_index: task.orderIndex ?? index,
          is_premium: task.isPremium ?? null,
          preview_sec: null,
        })),
      };
    } catch (sanityError) {
      // Sanity からの NOT_FOUND はそのまま再スロー
      if (sanityError instanceof TrainingError) {
        throw sanityError;
      }

      console.error("[getTrainingDetail] Sanity フォールバックも失敗:", sanityError);

      // 3. エラーをスロー（第3段階）— ページの notFound() で処理される
      throw new TrainingError(
        "トレーニング詳細の取得に失敗しました",
        "FETCH_ERROR"
      );
    }
  }
};
