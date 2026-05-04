import 'server-only'
import { createClient } from "@/lib/supabase/server";
import { getTrainingDetailFromSanity } from "@/lib/sanity";
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
 *
 * 3段階フォールバック:
 * 1. Edge Function（get-training-content）
 * 2. Sanity CMS からトレーニング詳細を取得し、タスクメタ情報を返す
 *    （タスク本文は Storage にしかないため、コンテンツなしで返す）
 * 3. TrainingError をスロー（呼び出し元で notFound() 処理）
 */
export const getTrainingTaskDetail = async (
  trainingSlug: string,
  taskSlug: string
): Promise<TaskDetailData> => {
  if (!trainingSlug || !taskSlug) {
    throw new TrainingError(
      "トレーニングスラッグとタスクスラッグが必要です",
      "INVALID_REQUEST",
      400
    );
  }

  // 1. Edge Function（第1段階）
  try {
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
      console.error("[getTrainingTaskDetail] Edge Function エラー:", error);
      throw error;
    }

    if (!data?.success) {
      console.error("[getTrainingTaskDetail] Edge Function レスポンス不正:", data);
      throw new Error("レスポンス不正");
    }

    const responseData = data.data || data;
    const taskDetail = validateAndTransformResponse(
      responseData as Record<string, unknown>,
      trainingSlug,
      taskSlug
    );

    return taskDetail;
  } catch (edgeFnError) {
    console.warn("[getTrainingTaskDetail] Edge Function 失敗、Sanity フォールバックへ:", edgeFnError);

    // 2. Sanity CMS フォールバック（第2段階）
    // タスク本文は Supabase Storage のみに存在するため、
    // Sanity からはタスクのメタ情報（タイトル・順序等）のみ取得し、
    // コンテンツは空で返す（ページ側で「コンテンツが利用できません」を表示）
    try {
      const sanityData = await getTrainingDetailFromSanity(trainingSlug);

      if (!sanityData) {
        throw new TrainingError(
          "トレーニングが見つかりません",
          "NOT_FOUND",
          404
        );
      }

      const sanityTask = (sanityData.tasks || []).find(
        (t) => t.slug === taskSlug
      );

      if (!sanityTask) {
        throw new TrainingError(
          "タスクが見つかりません",
          "NOT_FOUND",
          404
        );
      }

      // タスクの順序を取得して前後のタスクを計算
      const sortedTasks = [...(sanityData.tasks || [])].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      );
      const currentIndex = sortedTasks.findIndex((t) => t.slug === taskSlug);
      const prevTask = currentIndex > 0 ? sortedTasks[currentIndex - 1] : null;
      const nextTask = currentIndex < sortedTasks.length - 1 ? sortedTasks[currentIndex + 1] : null;

      return {
        id: sanityTask._id,
        slug: sanityTask.slug,
        title: sanityTask.title,
        content: "", // Storage にしかないため空
        is_premium: sanityTask.isPremium ?? false,
        order_index: sanityTask.orderIndex ?? 1,
        training_id: sanityData._id,
        created_at: null,
        video_full: null,
        video_preview: null,
        preview_sec: null,
        trainingTitle: sanityData.title,
        trainingSlug: trainingSlug,
        next_task: nextTask?.slug ?? null,
        prev_task: prevTask?.slug ?? null,
        isPremiumCut: false,
        hasAccess: true,
      };
    } catch (sanityError) {
      // Sanity からの NOT_FOUND はそのまま再スロー
      if (sanityError instanceof TrainingError) {
        throw sanityError;
      }

      console.error("[getTrainingTaskDetail] Sanity フォールバックも失敗:", sanityError);

      // 3. エラーをスロー（第3段階）— ページの notFound() で処理される
      throw new TrainingError(
        "タスク詳細の取得に失敗しました",
        "FETCH_ERROR"
      );
    }
  }
};
