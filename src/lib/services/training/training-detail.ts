import 'server-only'
import { createClient } from "@/lib/supabase/server";
import type { TrainingDetailData } from "@/types/training";
import { TrainingError } from "@/lib/errors";

/**
 * トレーニング詳細情報を取得（Storageベース）
 */
export const getTrainingDetail = async (
  slug: string
): Promise<TrainingDetailData> => {
  try {
    if (!slug || slug.trim() === "") {
      throw new TrainingError(
        "トレーニングスラッグが指定されていません",
        "INVALID_REQUEST",
        400
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "get-training-detail",
      {
        body: { slug },
      }
    );

    if (error) {
      console.error("Edge Function エラー:", error);
      throw new TrainingError(
        "トレーニング詳細の取得に失敗しました",
        "FETCH_ERROR"
      );
    }

    if (!data?.success || !data?.data) {
      throw new TrainingError(
        "トレーニング詳細のレスポンスが不正です",
        "INVALID_RESPONSE"
      );
    }

    return data.data as TrainingDetailData;
  } catch (err) {
    if (err instanceof TrainingError) {
      throw err;
    }

    console.error("getTrainingDetail 予期しないエラー:", err);
    throw new TrainingError(
      "トレーニング詳細の取得中に予期しないエラーが発生しました",
      "UNKNOWN_ERROR"
    );
  }
};
