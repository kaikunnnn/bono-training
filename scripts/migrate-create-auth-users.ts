import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as dotenv from "dotenv";

// .envファイルを読み込む
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface StripeCustomer {
  id: string; // Column: "id"
  Email: string; // Column: "Email"
  Name: string; // Column: "Name"
  "Created (UTC)": string;
  "msAppId (metadata)"?: string;
  "msMemberId (metadata)"?: string;
}

async function createAuthUsers(csvFilePath: string) {
  // CSVを読み込み
  const csvContent = fs.readFileSync(csvFilePath, "utf-8");
  const customers: StripeCustomer[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`📊 Total customers to migrate: ${customers.length}`);
  console.log(`📁 Reading from: ${csvFilePath}\n`);

  // 既存のAuthユーザーを取得
  const { data: existingUsersData } = await supabase.auth.admin.listUsers();
  const existingEmails = new Set(
    existingUsersData?.users.map((u) => u.email?.toLowerCase()) || []
  );

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // バッチ処理（5件ずつ、レート制限対策）
  for (let i = 0; i < customers.length; i += 5) {
    const batch = customers.slice(i, i + 5);

    console.log(`\n📦 Processing batch ${Math.floor(i / 5) + 1}/${Math.ceil(customers.length / 5)} (${i + 1}-${Math.min(i + 5, customers.length)}/${customers.length})`);

    await Promise.all(
      batch.map(async (customer) => {
        try {
          const email = customer.Email.toLowerCase();

          // 既存ユーザーをスキップ
          if (existingEmails.has(email)) {
            console.log(`⏭️  Skipped (already exists): ${customer.Email}`);
            skippedCount++;
            return;
          }

          // Supabase Authユーザーを作成
          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email: customer.Email,
              email_confirm: true, // メール確認済みとする
              user_metadata: {
                name: customer.Name,
                stripe_customer_id: customer.id,
                memberstack_app_id: customer["msAppId (metadata)"],
                memberstack_member_id: customer["msMemberId (metadata)"],
                migrated_from: "stripe",
                migrated_at: new Date().toISOString(),
              },
            });

          if (authError) {
            throw authError;
          }

          console.log(
            `✅ Created user: ${customer.Email} (${authData.user.id})`
          );
          successCount++;
        } catch (error: any) {
          console.error(
            `❌ Failed to create user: ${customer.Email}`,
            error.message
          );
          errors.push({ email: customer.Email, error: error.message });
          errorCount++;
        }
      })
    );

    // レート制限対策（2秒待機）
    if (i + 5 < customers.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // 結果サマリー
  console.log("\n========================================");
  console.log("Migration Summary - Auth Users");
  console.log("========================================");
  console.log(`Total: ${customers.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❌ Error: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => {
      console.log(`  - ${e.email}: ${e.error}`);
    });

    // エラーログをファイルに保存
    fs.writeFileSync(
      "./migration-errors-auth.json",
      JSON.stringify(errors, null, 2)
    );
    console.log("\n📝 Error log saved to: migration-errors-auth.json");
  }

  console.log("========================================\n");
}

// コマンドライン引数からファイル名を取得
const csvFile = process.argv[2] || "./stripe-customers-test.csv";

createAuthUsers(csvFile).catch(console.error);
