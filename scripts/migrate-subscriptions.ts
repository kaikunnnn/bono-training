import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as dotenv from "dotenv";

// .envファイルを読み込む
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StripeSubscription {
  id: string; // Subscription ID
  "Customer ID": string; // Customer ID
  Plan: string; // Price ID
  Status: string;
  "Current Period End (UTC)": string;
}

// Price IDからプラン情報を判定
function getPlanInfo(priceId: string) {
  const planMap: Record<string, { planType: string; duration: number }> = {
    price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
    price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
    price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
    price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}

async function migrateSubscriptions(csvFilePath: string) {
  const csvContent = fs.readFileSync(csvFilePath, "utf-8");
  const subscriptions: StripeSubscription[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`📊 Total subscriptions to migrate: ${subscriptions.length}`);
  console.log(`📁 Reading from: ${csvFilePath}\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const sub of subscriptions) {
    try {
      // stripe_customersテーブルからuser_idを取得
      const { data: customerData, error: getCustomerError } = await supabase
        .from("stripe_customers")
        .select("user_id")
        .eq("stripe_customer_id", sub["Customer ID"])
        .single();

      if (getCustomerError || !customerData) {
        throw new Error(`Customer not found: ${sub["Customer ID"]}`);
      }

      const planInfo = getPlanInfo(sub.Plan);
      const isActive =
        sub.Status === "active" || sub.Status === "trialing";

      // Current Period Endをパース
      // フォーマット: "2026-02-18 00:45"
      const periodEndDate = new Date(sub["Current Period End (UTC)"]);

      // user_subscriptionsテーブルにupsert
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .upsert(
          {
            user_id: customerData.user_id,
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub["Customer ID"],
            plan_type: planInfo.planType,
            duration: planInfo.duration,
            is_active: isActive,
            plan_members: planInfo.planType === "standard", // Standardプランのみtrue
            cancel_at_period_end: false, // CSVにはこの情報がないのでfalse
            current_period_end: periodEndDate.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (insertError) throw insertError;

      console.log(`✅ Migrated subscription: ${sub.id} (${sub.Status})`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed: ${sub.id}`, error.message);
      errors.push({ id: sub.id, error: error.message });
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log("Migration Summary - Subscriptions");
  console.log("========================================");
  console.log(`✅ Success: ${successCount} / ${subscriptions.length}`);
  console.log(`❌ Error: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => {
      console.log(`  - ${e.id}: ${e.error}`);
    });

    fs.writeFileSync(
      "./migration-errors-subscriptions.json",
      JSON.stringify(errors, null, 2)
    );
    console.log("\n📝 Error log saved to: migration-errors-subscriptions.json");
  }

  console.log("========================================\n");
}

// コマンドライン引数からファイル名を取得
const csvFile = process.argv[2] || "./stripe-subscriptions-test.csv";

migrateSubscriptions(csvFile).catch(console.error);
