import 'server-only'
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseAnonClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTrainingDetailFromSanity } from "@/lib/sanity";
import type { TrainingDetailData } from "@/types/training";
import { TrainingError } from "@/lib/errors";

/**
 * Edge Function 呼び出し専用の cookie-free Supabase クライアント（遅延初期化）
 *
 * unstable_cache のキャッシュ関数内では cookies() 等の動的APIが使えないため、
 * @/lib/supabase/server の createClient（cookieベース）は使えない。
 * Edge Function は内部で SERVICE_ROLE を使い、呼び出し元のユーザー識別に依存しない
 * （結果はユーザー非依存）ため、anon キーの cookie なしクライアントで呼び出す。
 */
let anonClient: SupabaseClient | null = null;
const getAnonClient = (): SupabaseClient => {
  if (!anonClient) {
    anonClient = createSupabaseAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return anonClient;
};

/**
 * トレーニング詳細情報を取得（Storageベース）
 *
 * 3段階フォールバック:
 * 1. Edge Function（get-training-detail）
 * 2. Sanity CMS 直接クエリ
 * 3. TrainingError をスロー（呼び出し元で notFound() 処理）
 *
 * unstable_cache で永続キャッシュ（リクエスト横断・ユーザー横断で共有）。
 * slug は関数引数としてキャッシュキーに自動的に含まれる。
 */
export const getTrainingDetail = unstable_cache(async (
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
    const supabase = getAnonClient();

    const { data, error } = await supabase.functions.invoke(
      "get-training-detail",
      {
        body: { slug: normalizedSlug },
      }
    );

    if (error) {
      throw error;
    }

    if (!data?.success || !data?.data) {
      throw new Error("レスポンス不正");
    }

    const result = data.data as TrainingDetailData;

    // Edge Functionが返すslugとリクエストslugが一致するか検証
    // ローカルStorage のフォルダ名不一致で別トレーニングのデータが返ることがある
    if (result.slug && result.slug.trim() !== normalizedSlug) {
      console.warn("[getTrainingDetail] Edge Function のslug不一致:", {
        requested: normalizedSlug,
        returned: result.slug,
      });
      throw new Error("slug不一致: Sanityフォールバックへ");
    }

    return result;
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
}, ["training:detail"], { tags: ["training"], revalidate: 3600 });
