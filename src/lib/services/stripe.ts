"use client";

import { createClient } from "@/lib/supabase/client";
import type { PlanType, PlanDuration } from "@/types/subscription";

/**
 * Stripeチェックアウトセッションを作成する
 * @param returnUrl チェックアウト完了後のリダイレクトURL
 * @param planType プランタイプ（standard, feedback等）
 * @param duration プラン期間（1ヶ月または3ヶ月）
 */
export async function createCheckoutSession(
  returnUrl: string,
  planType: PlanType = "standard",
  duration: PlanDuration = 1
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const supabase = createClient();

    // ユーザーが認証済みか確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("認証されていません。ログインしてください。");
    }

    console.log(`Checkout開始: プラン=${planType}, 期間=${duration}ヶ月`);

    // Supabase Edge Functionを呼び出してCheckoutセッションを作成
    const response = await supabase.functions.invoke("create-checkout", {
      body: {
        returnUrl,
        planType,
        duration,
      },
    });

    console.log("🔍 Edge Function Response:", response);

    if (response.error) {
      console.error("❌ Checkoutセッション作成エラー:", response.error);
      console.error("❌ Response data:", response.data);

      let errorMessage = "決済処理の準備に失敗しました。";
      let errorDetails: string | undefined;

      // 方法0（最優先）: @supabase/ssr の functions.invoke は非2xxレスポンス時に
      // response.data=null, response.error.context={} になるため、
      // raw Response オブジェクトからボディを直接読む
      const rawResponse = (response as unknown as Record<string, unknown>).response;
      if (rawResponse instanceof Response) {
        try {
          const cloned = rawResponse.clone();
          const errorBody = await cloned.json();
          console.error("❌ Edge Function レスポンスボディ:", errorBody);
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
          if (errorBody.details) {
            errorDetails = errorBody.details;
          }
        } catch (parseError) {
          console.warn("raw Responseのパースに失敗:", parseError);
        }
      }
      // 方法1: response.dataにエラーメッセージが含まれている場合
      else if (response.data) {
        errorMessage =
          response.data.error || response.data.message || errorMessage;
        errorDetails = response.data.details;
      }
      // 方法2: response.errorのcontextから取得
      else if (typeof response.error === "object") {
        const errorObj = response.error as Record<string, unknown>;
        const errorContext = errorObj.context as Record<string, unknown> | undefined;
        if (errorContext?.body) {
          try {
            const errorBody =
              typeof errorContext.body === "string"
                ? JSON.parse(errorContext.body)
                : errorContext.body;
            if (errorBody.error) errorMessage = errorBody.error;
            if (errorBody.details) errorDetails = errorBody.details;
          } catch {
            if (typeof errorContext.body === "string") {
              errorMessage = errorContext.body;
            }
          }
        } else if (errorObj.message) {
          errorMessage = errorObj.message as string;
        }
      }

      if (errorDetails) {
        console.error("❌ エラー詳細:", errorDetails);
      }

      const fullErrorMessage = errorDetails
        ? `${errorMessage}\n\n詳細:\n${errorDetails}`
        : errorMessage;

      throw new Error(fullErrorMessage);
    }

    const { data, error } = response;

    if (error) {
      console.error("Checkoutセッション作成エラー:", error);
      throw new Error("決済処理の準備に失敗しました。");
    }

    console.log("Checkoutセッション作成成功:", data.url);

    return { url: data.url, error: null };
  } catch (error) {
    console.error("Stripe決済エラー:", error);
    return { url: null, error: error as Error };
  }
}

/**
 * Stripeカスタマーポータルのセッションを作成し、URLを取得する
 * @param returnUrl ポータルから戻る際のリダイレクトURL
 * @param planType 変更先のプランタイプ（Deep Link用）
 * @param duration 変更先のプラン期間（Deep Link用）
 */
export async function getCustomerPortalUrl(
  returnUrl?: string,
  planType?: PlanType,
  duration?: PlanDuration
): Promise<string> {
  try {
    const supabase = createClient();

    // ユーザーが認証済みか確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("認証されていません。ログインしてください。");
    }

    // デフォルトのリターンURLを設定
    const defaultReturnUrl = `${window.location.origin}/account`;

    // Supabase Edge Functionを呼び出してカスタマーポータルセッションを作成
    const { data, error } = await supabase.functions.invoke(
      "create-customer-portal",
      {
        body: {
          returnUrl: returnUrl || defaultReturnUrl,
          planType,
          duration,
        },
      }
    );

    if (error) {
      console.error("カスタマーポータルセッション作成エラー:", error);
      throw new Error("カスタマーポータルの作成に失敗しました。");
    }

    if (!data || !data.url) {
      throw new Error("カスタマーポータルURLの取得に失敗しました。");
    }

    return data.url;
  } catch (error) {
    console.error("カスタマーポータルURL取得エラー:", error);
    throw error;
  }
}

/**
 * 既存サブスクリプションのプランを変更する
 * @param planType 変更先のプランタイプ
 * @param duration プラン期間（1ヶ月または3ヶ月）
 */
export async function updateSubscription(
  planType: PlanType,
  duration: PlanDuration = 1
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = createClient();

    // ユーザーが認証済みか確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("認証されていません。ログインしてください。");
    }

    console.log(`プラン変更開始: プラン=${planType}, 期間=${duration}ヶ月`);

    // Supabase Edge Functionを呼び出してサブスクリプションを更新
    const { data, error } = await supabase.functions.invoke(
      "update-subscription",
      {
        body: {
          planType,
          duration,
        },
      }
    );

    if (error) {
      console.error("サブスクリプション更新エラー:", error);
      throw new Error("プラン変更に失敗しました。");
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "プラン変更に失敗しました。");
    }

    console.log("プラン変更成功:", data);

    return { success: true, error: null };
  } catch (error) {
    console.error("プラン変更エラー:", error);
    return { success: false, error: error as Error };
  }
}
