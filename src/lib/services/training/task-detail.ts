import 'server-only'
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTrainingTaskDetailFromSanity } from "@/lib/sanity";
import type { SanityTrainingTaskDetail } from "@/lib/sanity";
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
 * SanityのPortable Textタスクを画面用の型へ変換する。
 */
const transformSanityTaskDetail = (
  data: SanityTrainingTaskDetail,
  fallbackTrainingSlug: string
): TaskDetailData => {
  const allTasks = data.allTasks || [];
  const currentIndex = allTasks.findIndex((task) => task.slug === data.slug);

  return {
    id: data._id,
    slug: data.slug,
    title: data.title,
    content: "",
    is_premium: data.isPremium || false,
    order_index: data.orderIndex ?? 1,
    training_id: data.training?._id || "",
    created_at: null,
    video_full: data.videoFull || null,
    video_preview: data.videoPreview || null,
    preview_sec: data.previewSec || null,
    trainingTitle: data.training?.title || "",
    trainingSlug: data.training?.slug || fallbackTrainingSlug,
    trainingType: data.training?.type,
    prev_task: currentIndex > 0 ? allTasks[currentIndex - 1].slug : null,
    next_task:
      currentIndex >= 0 && currentIndex < allTasks.length - 1
        ? allTasks[currentIndex + 1].slug
        : null,
    isPremiumCut: false,
    hasAccess: true,
    description: data.description,
    sanitySections: data.sections || [],
  };
};

/**
 * タスク詳細を取得
 *
 * 3段階フォールバック:
 * 1. 無料かつPortable Text本文があるタスクはSanityキャッシュ
 * 2. 有料・Sanity未移行・Sanity障害時は認証付きEdge Function
 * 3. Edge失敗時は従来互換としてSanityへフォールバック
 * 4. TrainingError をスロー（呼び出し元で notFound() 処理）
 */
export const getTrainingTaskDetail = cache(async (
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

  const normalizedTrainingSlug = trainingSlug.trim();
  const normalizedTaskSlug = taskSlug.trim();
  let sanityData: SanityTrainingTaskDetail | null = null;

  // 現在の無料タスクはSanityに完全なPortable Text本文があるため、認証・Edge往復を省く。
  // 将来の有料タスクはhasAccess判定を維持するため、必ず従来のEdge経路へ進める。
  try {
    sanityData = await getTrainingTaskDetailFromSanity(
      normalizedTrainingSlug,
      normalizedTaskSlug
    );

    if (
      sanityData &&
      !sanityData.isPremium &&
      (sanityData.sections || []).length > 0
    ) {
      return transformSanityTaskDetail(sanityData, normalizedTrainingSlug);
    }
  } catch (sanityError) {
    console.warn("[getTrainingTaskDetail] Sanity 先行取得失敗、Edge Functionへ:", sanityError);
  }

  // 2. 有料・未移行・Sanity障害時は認証付きEdge Functionを使う。
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "get-training-content",
      {
        body: {
          trainingSlug: normalizedTrainingSlug,
          taskSlug: normalizedTaskSlug,
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
      normalizedTrainingSlug,
      normalizedTaskSlug
    );

    // Edge Function が空コンテンツを返した場合、Sanity から Portable Text セクションを補完
    if (!taskDetail.content && !taskDetail.sanitySections?.length) {
      try {
        const supplement =
          sanityData ||
          (await getTrainingTaskDetailFromSanity(
            normalizedTrainingSlug,
            normalizedTaskSlug
          ));
        if (supplement?.sections?.length) {
          taskDetail.sanitySections = supplement.sections;
          taskDetail.description =
            taskDetail.description || supplement.description;
          // Sanityのナビゲーション情報も補完
          if (!taskDetail.next_task && !taskDetail.prev_task) {
            const allTasks = supplement.allTasks || [];
            const currentIndex = allTasks.findIndex(
              (task) => task.slug === normalizedTaskSlug
            );
            taskDetail.prev_task =
              currentIndex > 0 ? allTasks[currentIndex - 1].slug : null;
            taskDetail.next_task =
              currentIndex < allTasks.length - 1
                ? allTasks[currentIndex + 1].slug
                : null;
          }
        }
      } catch (sanitySupplementError) {
        console.warn("[getTrainingTaskDetail] Sanity補完も失敗:", sanitySupplementError);
      }
    }

    return taskDetail;
  } catch (edgeFnError) {
    console.warn("[getTrainingTaskDetail] Edge Function 失敗、Sanity フォールバックへ:", edgeFnError);

    // 3. 従来互換のSanityフォールバック。
    try {
      const data =
        sanityData ||
        (await getTrainingTaskDetailFromSanity(
          normalizedTrainingSlug,
          normalizedTaskSlug
        ));

      if (!data) {
        throw new TrainingError(
          "タスクが見つかりません",
          "NOT_FOUND",
          404
        );
      }

      // 有料本文は権限確認に成功したEdgeレスポンスからだけ返す。
      if (data.isPremium) {
        throw new TrainingError(
          "有料タスクの権限を確認できませんでした",
          "FETCH_ERROR"
        );
      }

      return transformSanityTaskDetail(data, normalizedTrainingSlug);
    } catch (sanityError) {
      // Sanity からの NOT_FOUND はそのまま再スロー
      if (sanityError instanceof TrainingError) {
        throw sanityError;
      }

      console.error("[getTrainingTaskDetail] Sanity フォールバックも失敗:", sanityError);

      // 4. エラーをスロー（第4段階）— ページの notFound() で処理される
      throw new TrainingError(
        "タスク詳細の取得に失敗しました",
        "FETCH_ERROR"
      );
    }
  }
});
