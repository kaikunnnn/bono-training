/**
 * migration-errors-auth.jsonから失敗ユーザーを確認するスクリプト
 *
 * 実行方法:
 * npx tsx scripts/check-failed-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ErrorEntry {
  email: string;
  error: string;
}

async function checkFailedUsers() {
  console.log('\n========================================');
  console.log('失敗ユーザーの確認');
  console.log('========================================\n');

  // エラーログファイルを読み込み
  if (!fs.existsSync('migration-errors-auth.json')) {
    console.error('❌ migration-errors-auth.json が見つかりません');
    return;
  }

  const errorEntries: ErrorEntry[] = JSON.parse(
    fs.readFileSync('migration-errors-auth.json', 'utf-8')
  );

  console.log(`📊 エラー総数: ${errorEntries.length}件\n`);

  // エラーパターンごとに分類
  const alreadyRegistered: string[] = [];
  const databaseErrors: string[] = [];
  const jsonErrors: string[] = [];
  const otherErrors: ErrorEntry[] = [];

  for (const entry of errorEntries) {
    if (entry.error.includes('already been registered')) {
      alreadyRegistered.push(entry.email);
    } else if (entry.error.includes('Database error')) {
      databaseErrors.push(entry.email);
    } else if (entry.error.includes('not valid JSON')) {
      jsonErrors.push(entry.email);
    } else {
      otherErrors.push(entry);
    }
  }

  // 1. 既存ユーザー重複（問題なし）
  console.log('=== 1. 既存ユーザー重複（問題なし） ===');
  console.log(`件数: ${alreadyRegistered.length}件`);
  console.log('対処: 何もする必要なし（すでにAuthとuser_profilesに存在）\n');

  // 2. Database error（要確認）
  console.log('=== 2. Database Error（要確認） ===');
  console.log(`件数: ${databaseErrors.length}件`);

  if (databaseErrors.length > 0) {
    console.log('\n🔍 詳細確認中...\n');

    for (const email of databaseErrors) {
      // Authに存在するか確認
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users.find(u => u.email === email);

      if (authUser) {
        // user_profilesに存在するか確認
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', authUser.id)
          .single();

        if (profile) {
          console.log(`✅ ${email}: Auth ✅ / Profile ✅ → 問題なし`);
        } else {
          console.log(`⚠️  ${email}: Auth ✅ / Profile ❌ → 要修正`);
        }
      } else {
        console.log(`❌ ${email}: Auth ❌ → スクリプト再実行が必要`);
      }
    }
  }
  console.log();

  // 3. JSON parse error（リトライ必要）
  console.log('=== 3. JSON Parse Error（リトライ必要） ===');
  console.log(`件数: ${jsonErrors.length}件`);

  if (jsonErrors.length > 0) {
    console.log('\nリトライ対象:');
    jsonErrors.forEach(email => console.log(`  - ${email}`));

    // リトライ用JSONファイルを保存
    fs.writeFileSync(
      'retry-users.json',
      JSON.stringify(jsonErrors.map(email => ({ email })), null, 2)
    );
    console.log('\n📝 リトライ用ファイル保存: retry-users.json');
  }
  console.log();

  // 4. その他のエラー
  if (otherErrors.length > 0) {
    console.log('=== 4. その他のエラー ===');
    console.log(`件数: ${otherErrors.length}件\n`);
    otherErrors.forEach(entry => {
      console.log(`  - ${entry.email}: ${entry.error}`);
    });
    console.log();
  }

  // サマリー
  console.log('========================================');
  console.log('確認完了');
  console.log('========================================');
  console.log(`✅ 問題なし: ${alreadyRegistered.length}件`);
  console.log(`⚠️  要確認: ${databaseErrors.length}件`);
  console.log(`🔄 リトライ必要: ${jsonErrors.length}件`);
  console.log(`❓ その他: ${otherErrors.length}件`);
  console.log('========================================\n');
}

checkFailedUsers().catch(console.error);
