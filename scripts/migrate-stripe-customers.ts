import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as dotenv from "dotenv";

// .envファイルを読み込む
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StripeCustomer {
  id: string;
  Email: string;
}

async function migrateStripeCustomers(csvFilePath: string) {
  const csvContent = fs.readFileSync(csvFilePath, "utf-8");
  const customers: StripeCustomer[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`📊 Total customers to sync: ${customers.length}`);
  console.log(`📁 Reading from: ${csvFilePath}\n`);

  // 全てのAuthユーザーを一度に取得（ページネーション対応）
  console.log("🔍 Fetching all Auth users...");
  let allUsers: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: 1000,
    });

    if (error) throw error;

    allUsers = allUsers.concat(data.users);
    hasMore = data.users.length === 1000;
    page++;
  }

  console.log(`✅ Fetched ${allUsers.length} Auth users\n`);

  // メールアドレスでユーザーを検索するためのMap
  const userMap = new Map(
    allUsers.map((u) => [u.email?.toLowerCase(), u])
  );

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const customer of customers) {
    try {
      // Mapからユーザーを検索
      const user = userMap.get(customer.Email.toLowerCase());

      if (!user) {
        throw new Error(`User not found for email: ${customer.Email}`);
      }

      // stripe_customersテーブルにinsert（既存チェックしてからinsert）
      const { data: existing, error: checkError } = await supabase
        .from("stripe_customers")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      // エラーがなく、データが存在する場合のみスキップ
      if (!checkError && existing) {
        console.log(`⏭️  Skipped (already exists): ${customer.Email}`);
        successCount++;
        continue;
      }

      const { error: insertError } = await supabase
        .from("stripe_customers")
        .insert({
          user_id: user.id,
          stripe_customer_id: customer.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      console.log(`✅ Synced: ${customer.Email} → ${customer.id}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed: ${customer.Email}`, error.message);
      errors.push({ email: customer.Email, error: error.message });
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log("Migration Summary - Stripe Customers");
  console.log("========================================");
  console.log(`✅ Success: ${successCount} / ${customers.length}`);
  console.log(`❌ Error: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => {
      console.log(`  - ${e.email}: ${e.error}`);
    });

    fs.writeFileSync(
      "./migration-errors-customers.json",
      JSON.stringify(errors, null, 2)
    );
    console.log("\n📝 Error log saved to: migration-errors-customers.json");
  }

  console.log("========================================\n");
}

// コマンドライン引数からファイル名を取得
const csvFile = process.argv[2] || "./stripe-customers-test.csv";

migrateStripeCustomers(csvFile).catch(console.error);
