
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
   * サブスクリプション情報を更新
   */
  async updateSubscriptionStatus(
    userId: string,
    isActive: boolean,
    planType: string | null,
    stripeSubscriptionId?: string
  ) {
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
      logDebug("サブスクリプション情報更新成功");
    }
    
    return { data: updateData, error: updateError };
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
  async getStripeSubscription(): Promise<StripeSubscriptionInfo | null> {
    if (!this.stripe) return null;

    const subscriptions = await this.stripe.subscriptions.list({
      status: "active",
      expand: ["data.customer"],
      limit: 1,
    });
    
    logDebug("Stripeサブスクリプション検索結果", { 
      count: subscriptions.data.length,
    });
    
    if (subscriptions.data.length === 0) return null;

    const subscription = subscriptions.data[0];
    return {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end
    };
  }

  /**
   * プラン情報を取得
   */
  async getPlanInfo(subscription: StripeSubscriptionInfo) {
    if (!this.stripe) return null;

    logDebug("アクティブなサブスクリプション", { 
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
    
    const priceId = subscription.id;
    const price = await this.stripe.prices.retrieve(priceId);
    
    logDebug("価格情報", { 
      priceId,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval
    });
    
    return price;
  }
}
