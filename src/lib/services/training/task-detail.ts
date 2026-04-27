import { createClient } from "@/lib/supabase/server";
import type { TaskDetailData } from "@/types/training";
import { TrainingError } from "@/lib/errors";

/**
 * 安全にプロパティを取得するヘルパー関数
 */
const safeGet = <T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: T
): T => {
  try {
    const result = path
      .split(".")
      .reduce(
        (current: unknown, key) =>
          current && typeof current === "object"
            ? (current as Record<string, unknown>)[key]
            : undefined,
        obj
      );
    return (result ?? defaultValue) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * レスポンスデータの検証と変換
 */
const validateAndTransformResponse = (
  responseData: Record<string, unknown>,
  trainingSlug: string,
  taskSlug: string
): TaskDetailData => {
  if (!responseData) {
    throw new TrainingError("レスポンスデータが空です", "EMPTY_RESPONSE");
  }

  const content = safeGet<string>(responseData, "content", "");
  const meta = safeGet<Record<string, unknown>>(responseData, "meta", {});

  const isPremium = (() => {
    const rawValue = safeGet<unknown>(responseData, "isPremium", false);
    if (typeof rawValue === "boolean") return rawValue;
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
    return Boolean(rawValue);
  })();

  const orderIndex = (() => {
    const rawValue = safeGet<unknown>(meta, "order_index", 1);
    if (typeof rawValue === "number") return rawValue;
    const parsed = parseInt(String(rawValue), 10);
    return isNaN(parsed) ? 1 : parsed;
  })();

  const previewSec = (() => {
    const rawValue = safeGet<unknown>(meta, "preview_sec", 30);
    if (typeof rawValue === "number") return rawValue;
    const parsed = parseInt(String(rawValue), 10);
    return isNaN(parsed) ? 30 : parsed;
  })();

  const taskDetail: TaskDetailData = {
    id: `${trainingSlug}-${taskSlug}`,
    slug: taskSlug,
    title: safeGet<string>(meta, "title", taskSlug),
    content: content,
    is_premium: isPremium,
    order_index: orderIndex,
    training_id: trainingSlug,
    created_at: new Date().toISOString(),
    video_full: safeGet<string | null>(meta, "video_full", null),
    video_preview: safeGet<string | null>(meta, "video_preview", null),
    preview_sec: previewSec,
    trainingTitle: safeGet<string>(meta, "training_title", trainingSlug),
    trainingSlug: trainingSlug,
    next_task: safeGet<string | null>(meta, "next_task", null),
    prev_task: safeGet<string | null>(meta, "prev_task", null),
    isPremiumCut: safeGet<boolean>(responseData, "showPremiumBanner", false),
    hasAccess: safeGet<boolean>(responseData, "hasAccess", true),
    estimated_time: safeGet<string | undefined>(meta, "estimated_time", undefined),
    difficulty: safeGet<string | undefined>(meta, "difficulty", undefined),
    description: safeGet<string | undefined>(meta, "description", undefined),
  };

  return taskDetail;
};

/**
 * タスク詳細を取得（Storage + Edge Functionベース）
 */
export const getTrainingTaskDetail = async (
  trainingSlug: string,
  taskSlug: string
): Promise<TaskDetailData> => {
  try {
    if (!trainingSlug || !taskSlug) {
      throw new TrainingError(
        "トレーニングスラッグとタスクスラッグが必要です",
        "INVALID_REQUEST",
        400
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "get-training-content",
      {
        body: {
          trainingSlug: trainingSlug.trim(),
          taskSlug: taskSlug.trim(),
        },
      }
    );

    if (error) {
      console.error("Edge Function エラー:", error);
      throw new TrainingError(
        "タスク詳細の取得に失敗しました",
        "FETCH_ERROR"
      );
    }

    if (!data?.success) {
      throw new TrainingError(
        data?.message || "タスク詳細のレスポンスが不正です",
        "INVALID_RESPONSE"
      );
    }

    const responseData = data.data || data;
    const taskDetail = validateAndTransformResponse(
      responseData as Record<string, unknown>,
      trainingSlug,
      taskSlug
    );

    return taskDetail;
  } catch (err) {
    if (err instanceof TrainingError) {
      throw err;
    }

    console.error("getTrainingTaskDetail 予期しないエラー:", err);
    throw new TrainingError(
      "タスク詳細の取得中に予期しないエラーが発生しました",
      "UNKNOWN_ERROR"
    );
  }
};
