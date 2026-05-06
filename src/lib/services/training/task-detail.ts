import 'server-only'
import { createClient } from "@/lib/supabase/server";
import { getTrainingTaskDetailFromSanity } from "@/lib/sanity";
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
      throw error;
    }

    if (!data?.success) {
      throw new Error("レスポンス不正");
    }

    const responseData = data.data || data;
    const taskDetail = validateAndTransformResponse(
      responseData as Record<string, unknown>,
      trainingSlug,
      taskSlug
    );

    // Edge Function が空コンテンツを返した場合、Sanity から Portable Text セクションを補完
    if (!taskDetail.content && !taskDetail.sanitySections?.length) {
      try {
        const sanityData = await getTrainingTaskDetailFromSanity(trainingSlug, taskSlug);
        if (sanityData?.sections?.length) {
          taskDetail.sanitySections = sanityData.sections;
          taskDetail.description = taskDetail.description || sanityData.description;
          // Sanityのナビゲーション情報も補完
          if (!taskDetail.next_task && !taskDetail.prev_task) {
            const allTasks = sanityData.allTasks || [];
            const currentIndex = allTasks.findIndex((t) => t.slug === taskSlug);
            taskDetail.prev_task = currentIndex > 0 ? allTasks[currentIndex - 1].slug : null;
            taskDetail.next_task = currentIndex < allTasks.length - 1 ? allTasks[currentIndex + 1].slug : null;
          }
        }
      } catch (sanitySupplementError) {
        console.warn("[getTrainingTaskDetail] Sanity補完も失敗:", sanitySupplementError);
      }
    }

    return taskDetail;
  } catch (edgeFnError) {
    console.warn("[getTrainingTaskDetail] Edge Function 失敗、Sanity フォールバックへ:", edgeFnError);

    // 2. Sanity CMS フォールバック（第2段階）
    // mainと同じGROQクエリでPortable Textコンテンツを含むタスクデータを取得
    try {
      console.log("[getTrainingTaskDetail] Sanity フォールバック開始:", trainingSlug, taskSlug);
      const data = await getTrainingTaskDetailFromSanity(trainingSlug, taskSlug);

      if (!data) {
        throw new TrainingError(
          "タスクが見つかりません",
          "NOT_FOUND",
          404
        );
      }

      // 前後のタスクを算出（mainと同じロジック）
      const allTasks = data.allTasks || [];
      const currentIndex = allTasks.findIndex((t) => t.slug === taskSlug);
      const prevTask = currentIndex > 0 ? allTasks[currentIndex - 1].slug : null;
      const nextTask = currentIndex < allTasks.length - 1 ? allTasks[currentIndex + 1].slug : null;

      console.log("[getTrainingTaskDetail] Sanity フォールバック成功:", data.title);

      return {
        id: data._id,
        slug: data.slug,
        title: data.title,
        content: "", // Portable TextはsanitySectionsで提供
        is_premium: data.isPremium || false,
        order_index: data.orderIndex ?? 1,
        training_id: data.training?._id || "",
        created_at: null,
        video_full: data.videoFull || null,
        video_preview: data.videoPreview || null,
        preview_sec: data.previewSec || null,
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
