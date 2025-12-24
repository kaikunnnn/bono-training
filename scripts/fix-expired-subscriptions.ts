/**
 * 期限切れサブスクリプション修正スクリプト
 *
 * 問題: is_active=true のまま current_period_end が過去になっているユーザーがいる
 *
 * このスクリプトの動作:
 * 1. Supabaseから is_active=true かつ current_period_end < NOW() のユーザーを取得
 * 2. 各ユーザーのStripeサブスクリプション状態を確認
 * 3. ロジック:
 *    - Stripe status: canceled かつ current_period_end が過去 → is_active: false
 *    - Stripe status: active → current_period_end を更新（サブスクが更新されている）
 *    - Stripe status: canceled かつ current_period_end が未来 → そのまま（利用期間内）
 *    - Stripe subscription がない → is_active: false
 *
 * 使用方法:
 * SUPABASE_URL=https://xxx.supabase.co \
 * SUPABASE_SERVICE_ROLE_KEY=eyJxxx \
 * STRIPE_SECRET_KEY=sk_live_xxx \
 * npx tsx scripts/fix-expired-subscriptions.ts [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import * as fs from "fs";

// dotenv は使用しない（コマンドラインから環境変数を渡す）

// 環境変数から取得（複数の命名規則に対応）
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("");
  console.error("Usage:");
  console.error("  SUPABASE_URL=https://xxx.supabase.co \\");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=eyJxxx \\");
  console.error("  STRIPE_SECRET_KEY=sk_live_xxx \\");
  console.error("  npx tsx scripts/fix-expired-subscriptions.ts --dry-run");
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  console.error("");
  console.error("Usage:");
  console.error("  SUPABASE_URL=https://xxx.supabase.co \\");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=eyJxxx \\");
  console.error("  STRIPE_SECRET_KEY=sk_live_xxx \\");
  console.error("  npx tsx scripts/fix-expired-subscriptions.ts --dry-run");
  process.exit(1);
}

// 本番環境かどうか確認
if (!stripeSecretKey.startsWith("sk_live_")) {
  console.warn(
    "⚠️ Warning: Using test mode Stripe key. Production data will not be affected."
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey);

const isDryRun = process.argv.includes("--dry-run");

interface ExpiredUser {
  user_id: string;
  email?: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string;
  is_active: boolean;
  plan_type: string;
}

interface FixResult {
  userId: string;
  email?: string;
  stripeSubscriptionId: string | null;
  stripeStatus: string | null;
  supabaseCurrentPeriodEnd: string;
  stripeCurrentPeriodEnd: string | null;
  action: "deactivated" | "updated" | "skipped" | "error";
  reason: string;
}

async function fixExpiredSubscriptions() {
  console.log("========================================");
  console.log("期限切れサブスクリプション修正スクリプト");
  console.log("========================================");
  console.log(`Mode: ${isDryRun ? "🔍 DRY RUN (変更なし)" : "⚡ LIVE (変更を適用)"}`);
  console.log(`現在日時: ${new Date().toISOString()}`);
  console.log("");

  const results: FixResult[] = [];
  let deactivatedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // 1. Supabaseから is_active=true かつ current_period_end が過去のユーザーを取得
    console.log("📡 期限切れユーザーを取得中...");

    const now = new Date().toISOString();

    const { data: expiredUsers, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("user_id, stripe_subscription_id, stripe_customer_id, current_period_end, is_active, plan_type")
      .eq("is_active", true)
      .eq("environment", "live")
      .lt("current_period_end", now)
      .not("current_period_end", "is", null);

    if (fetchError) {
      throw new Error(`Supabaseクエリエラー: ${fetchError.message}`);
    }

    if (!expiredUsers || expiredUsers.length === 0) {
      console.log("✅ 期限切れユーザーはいません。");
      return;
    }

    console.log(`✅ 取得完了: ${expiredUsers.length} 件の期限切れユーザー\n`);

    // 2. 各ユーザーを処理
    for (const user of expiredUsers as ExpiredUser[]) {
      const { user_id, stripe_subscription_id, current_period_end } = user;

      try {
        // ユーザーのメールアドレスを取得
        const { data: userData } = await supabase.auth.admin.getUserById(user_id);
        const userEmail = userData?.user?.email || "unknown";

        console.log(`\n処理中: ${userEmail}`);
        console.log(`  Supabase current_period_end: ${current_period_end}`);

        // Stripe subscription IDがない場合
        if (!stripe_subscription_id) {
          console.log(`  ⚠️ stripe_subscription_id がありません`);

          // stripe_customers テーブルから customer_id を探す
          const { data: customerData } = await supabase
            .from("stripe_customers")
            .select("stripe_customer_id")
            .eq("user_id", user_id)
            .eq("environment", "live")
            .single();

          if (!customerData?.stripe_customer_id) {
            // Stripeの情報がない = 非アクティブ化
            if (isDryRun) {
              console.log(`  🔍 DRY RUN: is_active=false に更新予定（Stripe情報なし）`);
            } else {
              await supabase
                .from("user_subscriptions")
                .update({
                  is_active: false,
                  canceled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user_id)
                .eq("environment", "live");
              console.log(`  ✅ DEACTIVATED: Stripe情報なし`);
            }

            results.push({
              userId: user_id,
              email: userEmail,
              stripeSubscriptionId: null,
              stripeStatus: null,
              supabaseCurrentPeriodEnd: current_period_end,
              stripeCurrentPeriodEnd: null,
              action: "deactivated",
              reason: "Stripe情報なし",
            });
            deactivatedCount++;
            continue;
          }

          // customer_id があれば、そこからサブスクを探す
          const subscriptions = await stripe.subscriptions.list({
            customer: customerData.stripe_customer_id,
            status: "all",
            limit: 1,
          });

          if (subscriptions.data.length === 0) {
            // サブスクが存在しない = 非アクティブ化
            if (isDryRun) {
              console.log(`  🔍 DRY RUN: is_active=false に更新予定（Stripeにサブスクなし）`);
            } else {
              await supabase
                .from("user_subscriptions")
                .update({
                  is_active: false,
                  canceled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user_id)
                .eq("environment", "live");
              console.log(`  ✅ DEACTIVATED: Stripeにサブスクなし`);
            }

            results.push({
              userId: user_id,
              email: userEmail,
              stripeSubscriptionId: null,
              stripeStatus: null,
              supabaseCurrentPeriodEnd: current_period_end,
              stripeCurrentPeriodEnd: null,
              action: "deactivated",
              reason: "Stripeにサブスクなし",
            });
            deactivatedCount++;
            continue;
          }
        }

        // Stripeからサブスクリプション情報を取得
        let stripeSub: Stripe.Subscription | null = null;
        try {
          if (stripe_subscription_id) {
            stripeSub = await stripe.subscriptions.retrieve(stripe_subscription_id);
          }
        } catch (stripeError: any) {
          if (stripeError.code === "resource_missing") {
            console.log(`  ⚠️ Stripeにサブスクが存在しません`);

            // サブスクが削除されている = 非アクティブ化
            if (isDryRun) {
              console.log(`  🔍 DRY RUN: is_active=false に更新予定（Stripeで削除済み）`);
            } else {
              await supabase
                .from("user_subscriptions")
                .update({
                  is_active: false,
                  canceled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user_id)
                .eq("environment", "live");
              console.log(`  ✅ DEACTIVATED: Stripeで削除済み`);
            }

            results.push({
              userId: user_id,
              email: userEmail,
              stripeSubscriptionId: stripe_subscription_id,
              stripeStatus: "deleted",
              supabaseCurrentPeriodEnd: current_period_end,
              stripeCurrentPeriodEnd: null,
              action: "deactivated",
              reason: "Stripeで削除済み",
            });
            deactivatedCount++;
            continue;
          }
          throw stripeError;
        }

        if (!stripeSub) {
          throw new Error("Stripeサブスク取得に失敗");
        }

        const stripeStatus = stripeSub.status;

        // current_period_end の安全な処理
        let stripeCurrentPeriodEnd: string | null = null;
        if (stripeSub.current_period_end && typeof stripeSub.current_period_end === 'number') {
          stripeCurrentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
        }

        console.log(`  Stripe status: ${stripeStatus}`);
        console.log(`  Stripe current_period_end: ${stripeCurrentPeriodEnd}`);

        // ロジック判定
        if (stripeStatus === "active" || stripeStatus === "trialing") {
          // サブスクがアクティブ = current_period_end を更新
          if (isDryRun) {
            console.log(`  🔍 DRY RUN: current_period_end を更新予定（${stripeCurrentPeriodEnd}）`);
          } else {
            await supabase
              .from("user_subscriptions")
              .update({
                current_period_end: stripeCurrentPeriodEnd,
                cancel_at_period_end: stripeSub.cancel_at_period_end || false,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user_id)
              .eq("environment", "live");
            console.log(`  ✅ UPDATED: current_period_end を更新`);
          }

          results.push({
            userId: user_id,
            email: userEmail,
            stripeSubscriptionId: stripe_subscription_id,
            stripeStatus,
            supabaseCurrentPeriodEnd: current_period_end,
            stripeCurrentPeriodEnd,
            action: "updated",
            reason: "Stripeでアクティブ - current_period_end更新",
          });
          updatedCount++;
        } else if (stripeStatus === "canceled") {
          // キャンセル済み
          const nowDate = new Date();

          // current_period_end の安全な処理
          let stripeEndDate: Date | null = null;
          if (stripeSub.current_period_end && typeof stripeSub.current_period_end === 'number') {
            stripeEndDate = new Date(stripeSub.current_period_end * 1000);
          }

          if (!stripeEndDate || stripeEndDate < nowDate) {
            // 利用期間終了 = 非アクティブ化
            if (isDryRun) {
              console.log(`  🔍 DRY RUN: is_active=false に更新予定（キャンセル済み＆利用期間終了）`);
            } else {
              await supabase
                .from("user_subscriptions")
                .update({
                  is_active: false,
                  canceled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user_id)
                .eq("environment", "live");
              console.log(`  ✅ DEACTIVATED: キャンセル済み＆利用期間終了`);
            }

            results.push({
              userId: user_id,
              email: userEmail,
              stripeSubscriptionId: stripe_subscription_id,
              stripeStatus,
              supabaseCurrentPeriodEnd: current_period_end,
              stripeCurrentPeriodEnd,
              action: "deactivated",
              reason: "キャンセル済み＆利用期間終了",
            });
            deactivatedCount++;
          } else {
            // まだ利用期間内 = スキップ（これは通常起こらないはず、Supabaseのcurrent_period_endが古い）
            console.log(`  ⏭️ SKIP: キャンセル済みだが利用期間内`);

            results.push({
              userId: user_id,
              email: userEmail,
              stripeSubscriptionId: stripe_subscription_id,
              stripeStatus,
              supabaseCurrentPeriodEnd: current_period_end,
              stripeCurrentPeriodEnd,
              action: "skipped",
              reason: "キャンセル済みだが利用期間内（Supabase更新が遅延）",
            });
            skippedCount++;
          }
        } else {
          // その他のステータス（past_due, unpaid, incomplete など）
          console.log(`  ⏭️ SKIP: 特殊ステータス ${stripeStatus}`);

          results.push({
            userId: user_id,
            email: userEmail,
            stripeSubscriptionId: stripe_subscription_id,
            stripeStatus,
            supabaseCurrentPeriodEnd: current_period_end,
            stripeCurrentPeriodEnd,
            action: "skipped",
            reason: `特殊ステータス: ${stripeStatus}`,
          });
          skippedCount++;
        }
      } catch (error: any) {
        results.push({
          userId: user_id,
          email: "unknown",
          stripeSubscriptionId: stripe_subscription_id,
          stripeStatus: null,
          supabaseCurrentPeriodEnd: current_period_end,
          stripeCurrentPeriodEnd: null,
          action: "error",
          reason: error.message,
        });
        errorCount++;
        console.error(`  ❌ ERROR: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }

  // 結果サマリー
  console.log("\n========================================");
  console.log("修正結果サマリー");
  console.log("========================================");
  console.log(`❌ 非アクティブ化${isDryRun ? "予定" : "完了"}: ${deactivatedCount} 件`);
  console.log(`✅ 更新${isDryRun ? "予定" : "完了"}: ${updatedCount} 件`);
  console.log(`⏭️ スキップ: ${skippedCount} 件`);
  console.log(`❌ エラー: ${errorCount} 件`);
  console.log("========================================\n");

  // エラーがあった場合はログに出力
  const errors = results.filter((r) => r.action === "error");
  if (errors.length > 0) {
    console.log("❌ エラー詳細:");
    errors.forEach((e) => {
      console.log(`  - ${e.email}: ${e.reason}`);
    });
  }

  // 非アクティブ化対象の詳細
  const deactivated = results.filter((r) => r.action === "deactivated");
  if (deactivated.length > 0) {
    console.log(`\n📋 非アクティブ化${isDryRun ? "予定" : "完了"}のユーザー:`);
    deactivated.forEach((d) => {
      console.log(`  - ${d.email}: ${d.reason}`);
    });
  }

  // 更新対象の詳細
  const updated = results.filter((r) => r.action === "updated");
  if (updated.length > 0) {
    console.log(`\n📋 更新${isDryRun ? "予定" : "完了"}のユーザー:`);
    updated.forEach((u) => {
      console.log(`  - ${u.email}: ${u.reason}`);
    });
  }

  // 結果をJSONファイルに保存
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `fix-expired-subscriptions-${isDryRun ? "dryrun" : "result"}-${timestamp}.json`;

  const reportData = {
    executedAt: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "live",
    summary: {
      deactivated: deactivatedCount,
      updated: updatedCount,
      skipped: skippedCount,
      error: errorCount,
      total: results.length,
    },
    results: results,
  };

  fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
  console.log(`\n📝 結果を保存しました: ${filename}`);
}

fixExpiredSubscriptions().catch(console.error);
