/**
 * サブスクリプション同期修正スクリプト
 *
 * 問題: 移行時にDBトリガーが user_subscriptions にデフォルト値を設定したが、
 *       Step 3（Stripe情報の同期）が未実行のため、is_active: false のまま残っている
 *
 * このスクリプトの動作:
 * 1. Stripeから全アクティブ/トライアル中サブスクリプションを取得
 * 2. stripe_customers テーブルで user_id を特定
 * 3. user_subscriptions テーブルを更新
 * 4. 結果をJSONファイルに出力
 *
 * 使用方法:
 * STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/fix-subscription-sync.ts [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// 環境変数から取得（複数の命名規則に対応）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("");
  console.error("Usage:");
  console.error("  SUPABASE_URL=https://xxx.supabase.co \\");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=eyJxxx \\");
  console.error("  STRIPE_SECRET_KEY=sk_live_xxx \\");
  console.error("  npx tsx scripts/fix-subscription-sync.ts --dry-run");
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  console.error("");
  console.error("Usage:");
  console.error("  SUPABASE_URL=https://xxx.supabase.co \\");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=eyJxxx \\");
  console.error("  STRIPE_SECRET_KEY=sk_live_xxx \\");
  console.error("  npx tsx scripts/fix-subscription-sync.ts --dry-run");
  process.exit(1);
}

// 本番環境かどうか確認
if (!stripeSecretKey.startsWith("sk_live_")) {
  console.warn("⚠️ Warning: Using test mode Stripe key. Production data will not be affected.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey);

const isDryRun = process.argv.includes("--dry-run");

// Price IDからプラン情報を判定
function getPlanInfo(priceId: string): { planType: string; duration: number } {
  const planMap: Record<string, { planType: string; duration: number }> = {
    // 本番のPrice IDs
    price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
    price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
    price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
    price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },
    // 旧Price IDs（念のため）
    price_1OIiLxKUVUnt8GtyPH5xZpnG: { planType: "standard", duration: 1 },
    price_1QArX1KUVUnt8GtyFGwf5g0P: { planType: "standard", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}

interface SyncResult {
  customerId: string;
  subscriptionId: string;
  userId: string | null;
  email?: string;
  stripeStatus: string;
  action: "updated" | "skipped" | "error";
  reason?: string;
  priceId?: string;
  planType?: string;
}

async function fixSubscriptionSync() {
  console.log("========================================");
  console.log("サブスクリプション同期修正スクリプト");
  console.log("========================================");
  console.log(`Mode: ${isDryRun ? "🔍 DRY RUN (変更なし)" : "⚡ LIVE (変更を適用)"}`);
  console.log("");

  const results: SyncResult[] = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // 1. Stripeから全アクティブ/トライアル中サブスクリプションを取得
    console.log("📡 Stripeからサブスクリプションを取得中...");

    const subscriptions: Stripe.Subscription[] = [];

    // active と trialing の両方を取得
    for (const status of ["active", "trialing"] as const) {
      let hasMore = true;
      let startingAfter: string | undefined;

      while (hasMore) {
        const response = await stripe.subscriptions.list({
          status: status,
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.items.data.price"],
        });

        subscriptions.push(...response.data);
        hasMore = response.has_more;

        if (response.data.length > 0) {
          startingAfter = response.data[response.data.length - 1].id;
        }
      }

      console.log(`  - ${status}: ${subscriptions.filter(s => s.status === status).length} 件`);
    }

    console.log(`✅ 取得完了: 合計 ${subscriptions.length} 件\n`);

    // 2. 各サブスクリプションを処理
    for (const sub of subscriptions) {
      const customerId = sub.customer as string;
      const subscriptionId = sub.id;
      const priceId = sub.items.data[0]?.price?.id || "";
      const planInfo = getPlanInfo(priceId);

      try {
        // stripe_customers から user_id を取得
        const { data: customerData, error: customerError } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .eq("environment", "live")
          .single();

        if (customerError || !customerData) {
          results.push({
            customerId,
            subscriptionId,
            userId: null,
            stripeStatus: sub.status,
            action: "skipped",
            reason: "stripe_customersにレコードなし",
            priceId,
            planType: planInfo.planType,
          });
          skippedCount++;
          console.log(`⏭️ SKIP: ${customerId} - stripe_customersにレコードなし`);
          continue;
        }

        const userId = customerData.user_id;

        // ユーザーのメールアドレスを取得（admin APIを使用）
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email || "unknown";

        // 現在のuser_subscriptions状態を確認
        const { data: currentSub, error: currentSubError } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("environment", "live")
          .single();

        if (currentSubError && currentSubError.code !== "PGRST116") {
          throw new Error(`user_subscriptions取得エラー: ${currentSubError.message}`);
        }

        // 既に正しく同期されているかチェック
        if (currentSub?.is_active === true && currentSub?.stripe_subscription_id === subscriptionId) {
          results.push({
            customerId,
            subscriptionId,
            userId,
            email: userEmail,
            stripeStatus: sub.status,
            action: "skipped",
            reason: "既に同期済み",
            priceId,
            planType: planInfo.planType,
          });
          skippedCount++;
          continue;
        }

        // 更新データを準備
        // current_period_end の安全な処理
        let currentPeriodEnd: string | null = null;
        if (sub.current_period_end && typeof sub.current_period_end === 'number') {
          currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }

        const updateData = {
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          plan_type: planInfo.planType,
          duration: planInfo.duration,
          is_active: true,
          plan_members: planInfo.planType === "standard",
          cancel_at_period_end: sub.cancel_at_period_end || false,
          current_period_end: currentPeriodEnd,
          environment: "live",
          updated_at: new Date().toISOString(),
        };

        if (isDryRun) {
          console.log(`🔍 DRY RUN: ${userEmail} を更新予定`);
          console.log(`   Current: is_active=${currentSub?.is_active}, stripe_subscription_id=${currentSub?.stripe_subscription_id}`);
          console.log(`   New: is_active=true, stripe_subscription_id=${subscriptionId}, plan=${planInfo.planType}`);
        } else {
          // user_subscriptionsを更新
          const { error: upsertError } = await supabase
            .from("user_subscriptions")
            .upsert(updateData, {
              onConflict: "user_id,environment",
            });

          if (upsertError) {
            throw new Error(`upsertエラー: ${upsertError.message}`);
          }

          console.log(`✅ UPDATED: ${userEmail} (${customerId})`);
        }

        results.push({
          customerId,
          subscriptionId,
          userId,
          email: userEmail,
          stripeStatus: sub.status,
          action: "updated",
          priceId,
          planType: planInfo.planType,
        });
        updatedCount++;
      } catch (error: any) {
        results.push({
          customerId,
          subscriptionId,
          userId: null,
          stripeStatus: sub.status,
          action: "error",
          reason: error.message,
          priceId,
          planType: planInfo.planType,
        });
        errorCount++;
        console.error(`❌ ERROR: ${customerId} - ${error.message}`);
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
  console.log(`✅ 更新${isDryRun ? "予定" : "完了"}: ${updatedCount} 件`);
  console.log(`⏭️ スキップ: ${skippedCount} 件`);
  console.log(`❌ エラー: ${errorCount} 件`);
  console.log("========================================\n");

  // エラーがあった場合はログに出力
  const errors = results.filter((r) => r.action === "error");
  if (errors.length > 0) {
    console.log("❌ エラー詳細:");
    errors.forEach((e) => {
      console.log(`  - ${e.customerId}: ${e.reason}`);
    });
  }

  // スキップ（stripe_customersにレコードなし）の詳細
  const noCustomerRecord = results.filter(
    (r) => r.action === "skipped" && r.reason === "stripe_customersにレコードなし"
  );
  if (noCustomerRecord.length > 0) {
    console.log(`\n⚠️ stripe_customersにレコードがない顧客: ${noCustomerRecord.length} 件`);
    console.log("  これらの顧客はStep 2（stripe_customers同期）が必要です");
  }

  // 結果をJSONファイルに保存
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `fix-subscription-sync-${isDryRun ? "dryrun" : "result"}-${timestamp}.json`;

  const reportData = {
    executedAt: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "live",
    summary: {
      updated: updatedCount,
      skipped: skippedCount,
      error: errorCount,
      total: results.length,
    },
    results: results,
  };

  fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
  console.log(`\n📝 結果を保存しました: ${filename}`);

  // 更新対象にrenrenkon.800@gmail.comが含まれているか確認
  const targetUser = results.find(r => r.email === "renrenkon.800@gmail.com");
  if (targetUser) {
    console.log(`\n🎯 対象ユーザー確認: renrenkon.800@gmail.com`);
    console.log(`   Action: ${targetUser.action}`);
    console.log(`   Reason: ${targetUser.reason || "N/A"}`);
  }
}

fixSubscriptionSync().catch(console.error);
