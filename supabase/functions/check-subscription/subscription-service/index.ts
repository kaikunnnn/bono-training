
import { StripeOperations } from "./stripe-operations.ts";
import { DbOperations } from "./db-operations.ts";
import { PlanUtils } from "./plan-utils.ts";
import type Stripe from "https://esm.sh/stripe@14.21.0";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * サブスクリプション操作を集約したサービスクラス
 */
export class SubscriptionService {
  private readonly dbOperations: DbOperations;
  private readonly stripeOperations: StripeOperations;
  private readonly planUtils: PlanUtils;

  constructor(
    private readonly supabaseAdmin: SupabaseClient,
    private readonly stripe: Stripe | null
  ) {
    this.dbOperations = new DbOperations(supabaseAdmin);
    this.planUtils = new PlanUtils();
    this.stripeOperations = new StripeOperations(stripe, this.dbOperations);
  }

  /**
   * ユーザーの購読情報を取得
   */
  getUserSubscription = this.dbOperations.getUserSubscription.bind(this.dbOperations);

  /**
   * サブスクリプション情報を更新
   */
  updateSubscriptionStatus = this.dbOperations.updateSubscriptionStatus.bind(this.dbOperations);

  /**
   * プランタイプとメンバーシップ権限を判定
   */
  determinePlanInfo = this.planUtils.determinePlanInfo.bind(this.planUtils);

  /**
   * Stripeサブスクリプション情報を取得
   */
  getStripeSubscription = this.stripeOperations.getStripeSubscription.bind(this.stripeOperations);

  /**
   * プラン情報を取得
   */
  getPlanInfo = this.stripeOperations.getPlanInfo.bind(this.stripeOperations);
}
