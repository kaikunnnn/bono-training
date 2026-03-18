
import { UserSubscription } from "../types.ts";
import { logDebug, getCurrentEnvironment } from "../utils.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * データベース操作に関するクラス
 */
export class DbOperations {
  constructor(private readonly supabaseAdmin: SupabaseClient) {}

  /**
   * ユーザーの購読情報を取得
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      if (!userId) {
        logDebug("無効なユーザーID", { userId });
        return null;
      }

      // 現在の環境を判定
      const environment = getCurrentEnvironment();
      logDebug("購読情報取得開始", { userId, environment });

      // まず指定された環境で検索
      let { data, error } = await this.supabaseAdmin
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("environment", environment)
        .maybeSingle();

      if (error) {
        logDebug("データベースからの購読情報取得エラー", error);
        return null;
      }

      // 見つからなければ逆の環境でも検索（フォールバック）
      if (!data) {
        const fallbackEnvironment = environment === 'test' ? 'live' : 'test';
        logDebug("フォールバック検索", { userId, fallbackEnvironment });

        const fallbackResult = await this.supabaseAdmin
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("environment", fallbackEnvironment)
          .maybeSingle();

        data = fallbackResult.data;
        error = fallbackResult.error;

        if (error) {
          logDebug("フォールバック検索エラー", error);
          return null;
        }
      }

      if (!data) {
        logDebug("購読情報が見つかりません（両環境）", { userId });
        return null;
      }

      logDebug("データベースから購読情報を取得", { data, environment: data.environment });
      return data;
    } catch (err) {
      logDebug("予期せぬエラー - getUserSubscription", err);
      return null;
    }
  }

  /**
   * サブスクリプション情報を更新
   */
  async updateSubscriptionStatus(
    userId: string,
    isActive: boolean,
    planType: string | null,
    stripeSubscriptionId?: string
  ) {
    if (!userId) {
      logDebug("無効なユーザーID - 更新スキップ", { userId });
      return { data: null, error: new Error("無効なユーザーID") };
    }

    try {
      const { data: updateData, error: updateError } = await this.supabaseAdmin
        .from("user_subscriptions")
        .update({
          is_active: isActive,
          plan_type: planType,
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
        
      if (updateError) {
        logDebug("サブスクリプション情報更新エラー", updateError);
      } else {
        logDebug("サブスクリプション情報更新成功", { userId, isActive, planType });
      }
      
      return { data: updateData, error: updateError };
    } catch (err) {
      logDebug("予期せぬエラー - updateSubscriptionStatus", err);
      return { data: null, error: err instanceof Error ? err : new Error('不明なエラー') };
    }
  }
}
