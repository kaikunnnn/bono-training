import 'server-only'
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createClient as createSupabaseAnonClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTrainingDetailFromSanity } from "@/lib/sanity";
import type { SanityTrainingDetailItem } from "@/lib/sanity";
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
 * Sanityのトレーニング詳細を画面用の型へ変換する。
 */
const transformSanityTrainingDetail = (
  sanityData: SanityTrainingDetailItem
): TrainingDetailData => ({
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
    description: task.description,
    category: task.category,
    tags: task.tags || [],
  })),
});

/**
 * トレーニング詳細情報を取得
 *
 * 3段階フォールバック:
 * 1. Sanity CMS 直接クエリ（CDN + Next キャッシュ）
 * 2. Edge Function（get-training-detail）
 * 3. TrainingError をスロー（呼び出し元で notFound() 処理）
 *
 * unstable_cache で永続キャッシュ（リクエスト横断・ユーザー横断で共有）。
 * slug は関数引数としてキャッシュキーに自動的に含まれる。
 * React cache でgenerateMetadataとpageの同一リクエスト内呼び出しも共有する。
 */
const getCachedTrainingDetail = unstable_cache(async (
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
  let sanityError: unknown;

  // 1. 公開詳細の正本であるSanityを優先する。
  try {
    const sanityData = await getTrainingDetailFromSanity(normalizedSlug);

    if (sanityData) {
      return transformSanityTrainingDetail(sanityData);
    }

    sanityError = new TrainingError(
      "トレーニングが見つかりません",
      "NOT_FOUND",
      404
    );
  } catch (error) {
    sanityError = error;
    console.warn("[getTrainingDetail] Sanity 失敗、Edge Function フォールバックへ:", error);
  }

  // 2. Sanity障害または未移行コンテンツの場合だけ旧Edge Functionへ戻す。
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
    console.error("[getTrainingDetail] Edge Function フォールバックも失敗:", edgeFnError);

    if (sanityError instanceof TrainingError) {
      throw sanityError;
    }

    // 3. エラーをスロー（第3段階）— ページの notFound() で処理される
    throw new TrainingError(
      "トレーニング詳細の取得に失敗しました",
      "FETCH_ERROR"
    );
  }
}, ["training:detail"], { tags: ["training"], revalidate: 3600 });

export const getTrainingDetail = cache(getCachedTrainingDetail);
