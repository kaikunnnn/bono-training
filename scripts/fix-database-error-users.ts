/**
 * Database errorで失敗したユーザーのuser_profilesを作成するスクリプト
 *
 * 実行方法:
 * npx tsx scripts/fix-database-error-users.ts
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

async function fixDatabaseErrorUsers() {
  console.log('\n========================================');
  console.log('Database Error ユーザーの修正');
  console.log('========================================\n');

  // エラーログファイルを読み込み
  if (!fs.existsSync('migration-errors-auth.json')) {
    console.error('❌ migration-errors-auth.json が見つかりません');
    return;
  }

  const errorEntries = JSON.parse(
    fs.readFileSync('migration-errors-auth.json', 'utf-8')
  );

  // Database errorのみ抽出
  const databaseErrors = errorEntries.filter((entry: any) =>
    entry.error.includes('Database error')
  );

  console.log(`📊 Database error総数: ${databaseErrors.length}件\n`);

  if (databaseErrors.length === 0) {
    console.log('✅ Database errorはありません\n');
    return;
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const entry of databaseErrors) {
    const email = entry.email;

    try {
      // 1. Authユーザーを取得
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users.find(u => u.email === email);

      if (!authUser) {
        console.log(`❌ ${email}: Authユーザーが見つかりません`);
        errorCount++;
        continue;
      }

      // 2. user_profilesに存在するか確認
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', authUser.id)
        .single();

      if (existingProfile) {
        console.log(`⏭️  ${email}: すでにprofileが存在します`);
        skipCount++;
        continue;
      }

      // 3. user_profilesを作成
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.id,
          email: authUser.email,
          full_name: null,
          avatar_url: null,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.log(`❌ ${email}: Profile作成失敗 - ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${email}: Profile作成成功`);
        successCount++;
      }

    } catch (error) {
      console.log(`❌ ${email}: エラー - ${error}`);
      errorCount++;
    }
  }

  // サマリー
  console.log('\n========================================');
  console.log('修正完了');
  console.log('========================================');
  console.log(`対象ユーザー: ${databaseErrors.length}件`);
  console.log(`✅ 成功: ${successCount}件`);
  console.log(`⏭️  スキップ: ${skipCount}件`);
  console.log(`❌ 失敗: ${errorCount}件`);
  console.log('========================================\n');
}

fixDatabaseErrorUsers().catch(console.error);
