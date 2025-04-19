
import { StripeSubscriptionInfo, UserSubscription } from "./types.ts";
import { logDebug } from "./utils.ts";
import type Stripe from "https://esm.sh/stripe@14.21.0";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export class SubscriptionService {
  constructor(
    private readonly supabaseAdmin: SupabaseClient,
    private readonly stripe: Stripe | null
  ) {}

  /**
   * ユーザーの購読情報を取得
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      if (!userId) {
        logDebug("無効なユーザーID", { userId });
        return null;
      }

      const { data, error } = await this.supabaseAdmin
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        logDebug("データベースからの購読情報取得エラー", error);
        return null;
      }

      if (!data) {
        logDebug("購読情報が見つかりません", { userId });
        return null;
      }

      logDebug("データベースから購読情報を取得", data);
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

  /**
   * プランタイプを判定
   */
  determinePlanType(amount: number): string {
    if (amount <= 1000) {
      return "standard";
    } else if (amount <= 2000) {
      return "growth";
    }
    return "community";
  }

  /**
   * Stripeサブスクリプション情報を取得
   */
  async getStripeSubscription(userId: string): Promise<StripeSubscriptionInfo | null> {
    if (!this.stripe) {
      logDebug("Stripeクライアントが設定されていません");
      return null;
    }

    if (!userId) {
      logDebug("無効なユーザーID", { userId });
      return null;
    }

    try {
      // 最初にデータベースの購読情報をチェック
      const dbSubscription = await this.getUserSubscription(userId);
      if (dbSubscription?.is_active) {
        logDebug("データベースからアクティブな購読情報を検出", dbSubscription);
        return {
          id: dbSubscription.stripe_subscription_id || '',
          status: 'active',
          current_period_end: 0 // この値は現在使用されていない
        };
      }

      // ユーザーのStripe顧客情報を検索
      try {
        const customers = await this.stripe.customers.list({ 
          email: userId,
          limit: 1 
        });

        if (customers.data.length === 0) {
          logDebug("Stripe顧客情報が見つかりません", { userId });
          return null;
        }

        const customerId = customers.data[0].id;
        const subscriptions = await this.stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          expand: ["data.items.data.price"],
          limit: 1,
        });
        
        if (subscriptions.data.length === 0) {
          logDebug("アクティブなサブスクリプションが見つかりません", { customerId });
          return null;
        }

        const subscription = subscriptions.data[0];
        logDebug("Stripeサブスクリプション検索結果", { 
          id: subscription.id,
          status: subscription.status,
          customerId
        });

        return {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end
        };
      } catch (stripeErr) {
        logDebug("Stripeサブスクリプション検索エラー", stripeErr);
        return null;
      }
    } catch (error) {
      logDebug("Stripeサブスクリプション取得エラー", error);
      // Stripeのエラーが発生しても、データベースの情報を信頼する
      const dbSubscription = await this.getUserSubscription(userId);
      if (dbSubscription?.is_active) {
        return {
          id: dbSubscription.stripe_subscription_id || '',
          status: 'active',
          current_period_end: 0
        };
      }
      return null;
    }
  }

  /**
   * プラン情報を取得
   */
  async getPlanInfo(subscription: Stripe.Subscription): Promise<Stripe.Price | null> {
    if (!this.stripe || !subscription.items.data[0]?.price) return null;

    logDebug("アクティブなサブスクリプション", { 
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
    
    const price = subscription.items.data[0].price;
    
    logDebug("価格情報", { 
      priceId: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval
    });
    
    return price;
  }
}
