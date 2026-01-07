/**
 * 新規Stripeユーザー移行スクリプト
 *
 * 問題: 移行実施日（2025-11-19）以降に旧サイトで課金したユーザーが
 *       Supabaseに存在しない
 *
 * このスクリプトの動作:
 * 1. Stripeから全アクティブ/トライアル中サブスクリプションを取得
 * 2. 各サブスクのcustomer_idがstripe_customersに存在するか確認
 * 3. 存在しない場合:
 *    a. Stripeから顧客情報（メール）を取得
 *    b. auth.usersにユーザー作成（パスワードリセット必要）
 *    c. stripe_customersに紐付け作成
 *    d. user_subscriptionsに同期
 *
 * 使用方法:
 * SUPABASE_URL=https://xxx.supabase.co \
 * SUPABASE_SERVICE_ROLE_KEY=eyJxxx \
 * STRIPE_SECRET_KEY=sk_live_xxx \
 * npx tsx scripts/migrate-new-stripe-users.ts [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import * as fs from "fs";

// 環境変数から取得
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("");
  console.error("Usage:");
  console.error("  SUPABASE_URL=https://xxx.supabase.co \\");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=eyJxxx \\");
  console.error("  STRIPE_SECRET_KEY=sk_live_xxx \\");
  console.error("  npx tsx scripts/migrate-new-stripe-users.ts --dry-run");
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

if (!stripeSecretKey.startsWith("sk_live_")) {
  console.warn("⚠️ Warning: Using test mode Stripe key.");
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
    // 旧Price IDs
    price_1OIiLxKUVUnt8GtyPH5xZpnG: { planType: "standard", duration: 1 },
    price_1QArX1KUVUnt8GtyFGwf5g0P: { planType: "standard", duration: 3 },
    price_1OIiOUKUVUnt8GtyOfXEoEvW: { planType: "standard", duration: 1 },
    price_1OIiPpKUVUnt8Gty0OH3Pyip: { planType: "standard", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}

// ランダムパスワード生成（ユーザーはパスワードリセットで再設定）
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface MigrationResult {
  customerId: string;
  subscriptionId: string;
  email: string | null;
  action: "created" | "skipped" | "error";
  reason?: string;
  userId?: string;
}

async function migrateNewStripeUsers() {
  console.log("========================================");
  console.log("新規Stripeユーザー移行スクリプト");
  console.log("========================================");
  console.log(`Mode: ${isDryRun ? "🔍 DRY RUN (変更なし)" : "⚡ LIVE (変更を適用)"}`);
  console.log("");

  const results: MigrationResult[] = [];
  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // 1. Stripeから全アクティブ/トライアル中サブスクを取得
    console.log("📡 Stripeからサブスクリプションを取得中...");

    const subscriptions: Stripe.Subscription[] = [];

    for (const status of ["active", "trialing"] as const) {
      let hasMore = true;
      let startingAfter: string | undefined;

      while (hasMore) {
        const response = await stripe.subscriptions.list({
          status: status,
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.customer", "data.items.data.price"],
        });

        subscriptions.push(...response.data);
        hasMore = response.has_more;

        if (response.data.length > 0) {
          startingAfter = response.data[response.data.length - 1].id;
        }
      }
    }

    console.log(`✅ 取得完了: ${subscriptions.length} 件\n`);

    // 2. 各サブスクを処理
    for (const sub of subscriptions) {
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      const subscriptionId = sub.id;
      const priceId = sub.items.data[0]?.price?.id || "";
      const planInfo = getPlanInfo(priceId);

      try {
        // stripe_customersに存在するか確認
        const { data: existingCustomer } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .eq("environment", "live")
          .single();

        if (existingCustomer) {
          // 既に存在 → スキップ
          skippedCount++;
          continue;
        }

        // Stripeから顧客情報を取得
        const customer = typeof sub.customer === 'string'
          ? await stripe.customers.retrieve(sub.customer)
          : sub.customer;

        if (customer.deleted) {
          results.push({
            customerId,
            subscriptionId,
            email: null,
            action: "skipped",
            reason: "Stripe顧客が削除済み",
          });
          skippedCount++;
          continue;
        }

        const email = customer.email;
        if (!email) {
          results.push({
            customerId,
            subscriptionId,
            email: null,
            action: "skipped",
            reason: "メールアドレスなし",
          });
          skippedCount++;
          continue;
        }

        console.log(`\n処理中: ${email} (${customerId})`);

        // auth.usersに既に存在するか確認（メールで直接検索）
        const { data: existingUserData } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .single();

        // 上記が動かない場合のフォールバック: getUserByEmail的な処理
        const existingUserId: string | null = null;

        // メールでユーザーを検索（SQL直接実行）
        const { data: userLookup } = await supabase.rpc('get_user_id_by_email', { user_email: email }).single();

        // RPCが存在しない場合、直接SQLで確認
        if (!userLookup) {
          const { data: sqlResult } = await supabase
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .eq('environment', 'live')
            .single();

          if (!sqlResult) {
            // stripe_customersにないので、auth.usersを直接確認
            // listUsersは重いのでcreateUserを試してエラーハンドリング
          }
        }

        let userId: string;

        // まずユーザー作成を試みる（既存ならエラーになる）
        if (isDryRun) {
          console.log(`  🔍 DRY RUN: ユーザー作成予定 (${email})`);
          userId = "dry-run-user-id";
        } else {
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: generateRandomPassword(),
            email_confirm: true,
          });

          if (createError) {
            // 既にユーザーが存在する場合
            if (createError.message.includes('already been registered')) {
              // メールでユーザーIDを取得
              const { data: { users } } = await supabase.auth.admin.listUsers({
                page: 1,
                perPage: 1000,
              });
              const existingUser = users?.find(u => u.email === email);

              if (!existingUser) {
                // ページネーションで見つからない場合、さらに検索
                let found = false;
                let page = 2;
                while (!found && page <= 10) {
                  const { data: { users: moreUsers } } = await supabase.auth.admin.listUsers({
                    page: page,
                    perPage: 1000,
                  });
                  const user = moreUsers?.find(u => u.email === email);
                  if (user) {
                    userId = user.id;
                    found = true;
                    console.log(`  ユーザー存在（ページ${page}）: ${userId}`);
                    break;
                  }
                  if (!moreUsers || moreUsers.length === 0) break;
                  page++;
                }
                if (!found) {
                  throw new Error(`ユーザー作成失敗: ${createError.message}`);
                }
              } else {
                userId = existingUser.id;
                console.log(`  ユーザー存在: ${userId}`);
              }
            } else {
              throw new Error(`ユーザー作成失敗: ${createError.message}`);
            }
          } else if (newUser?.user) {
            userId = newUser.user.id;
            console.log(`  ✅ ユーザー作成: ${userId}`);
          } else {
            throw new Error('ユーザー作成失敗: 不明なエラー');
          }
        }

        // stripe_customersに紐付け作成
        if (isDryRun) {
          console.log(`  🔍 DRY RUN: stripe_customers作成予定`);
        } else {
          const { error: customerError } = await supabase
            .from("stripe_customers")
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              environment: "live",
              created_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,environment",
            });

          if (customerError) {
            throw new Error(`stripe_customers作成失敗: ${customerError.message}`);
          }
          console.log(`  ✅ stripe_customers作成`);
        }

        // user_subscriptionsを更新
        let currentPeriodEnd: string | null = null;
        if (sub.current_period_end && typeof sub.current_period_end === 'number') {
          currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }

        const subscriptionData = {
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
          console.log(`  🔍 DRY RUN: user_subscriptions作成予定 (${planInfo.planType})`);
        } else {
          const { error: subError } = await supabase
            .from("user_subscriptions")
            .upsert(subscriptionData, {
              onConflict: "user_id,environment",
            });

          if (subError) {
            throw new Error(`user_subscriptions作成失敗: ${subError.message}`);
          }
          console.log(`  ✅ user_subscriptions作成`);
        }

        results.push({
          customerId,
          subscriptionId,
          email,
          action: "created",
          userId,
        });
        createdCount++;

      } catch (error: any) {
        results.push({
          customerId,
          subscriptionId,
          email: null,
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
  console.log("移行結果サマリー");
  console.log("========================================");
  console.log(`✅ 作成${isDryRun ? "予定" : "完了"}: ${createdCount} 件`);
  console.log(`⏭️ スキップ（既存）: ${skippedCount} 件`);
  console.log(`❌ エラー: ${errorCount} 件`);
  console.log("========================================\n");

  // 作成対象の詳細
  const created = results.filter((r) => r.action === "created");
  if (created.length > 0) {
    console.log(`\n📋 作成${isDryRun ? "予定" : "完了"}のユーザー:`);
    created.forEach((c) => {
      console.log(`  - ${c.email} (${c.customerId})`);
    });
  }

  // エラーの詳細
  const errors = results.filter((r) => r.action === "error");
  if (errors.length > 0) {
    console.log("\n❌ エラー詳細:");
    errors.forEach((e) => {
      console.log(`  - ${e.customerId}: ${e.reason}`);
    });
  }

  // 結果をJSONファイルに保存
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `migrate-new-stripe-users-${isDryRun ? "dryrun" : "result"}-${timestamp}.json`;

  const reportData = {
    executedAt: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "live",
    summary: {
      created: createdCount,
      skipped: skippedCount,
      error: errorCount,
      total: results.length,
    },
    results: results,
  };

  fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
  console.log(`\n📝 結果を保存しました: ${filename}`);

  // 重要な注意事項
  if (!isDryRun && createdCount > 0) {
    console.log("\n⚠️ 重要: 新規作成されたユーザーはパスワードリセットが必要です");
    console.log("   https://bono.design/reset-password からリセットしてもらってください");
  }
}

migrateNewStripeUsers().catch(console.error);
