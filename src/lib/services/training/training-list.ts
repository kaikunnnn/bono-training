import 'server-only'
import { createClient } from "@/lib/supabase/server";
import type { Training } from "@/types/training";
import { TrainingError } from "@/lib/errors";

/**
 * トレーニング一覧を取得（Storageベース）
 */
export const getTrainings = async (): Promise<Training[]> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke("get-training-list", {
      body: {},
    });

    if (error) {
      console.error("Edge Function エラー:", error);
      throw new TrainingError(
        "トレーニング一覧の取得に失敗しました",
        "FETCH_ERROR"
      );
    }

    if (!data?.success || !data?.data) {
      throw new TrainingError(
        "トレーニング一覧のレスポンスが不正です",
        "INVALID_RESPONSE"
      );
    }

    return data.data as Training[];
  } catch (err) {
    if (err instanceof TrainingError) {
      throw err;
    }

    console.error("getTrainings 予期しないエラー:", err);

    // フォールバック: ダミーデータを返す
    return [
      {
        id: "todo-app-1",
        slug: "todo-app",
        title: "Todo アプリ UI 制作",
        description: "実践的な Todo アプリの UI デザインを学ぶ",
        type: "challenge" as const,
        difficulty: "normal",
        tags: ["ui", "todo", "実践"],
        icon: "📱",
        thumbnailImage: "https://source.unsplash.com/random/200x100",
      },
    ];
  }
};
