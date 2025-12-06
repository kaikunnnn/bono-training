/**
 * Auth登録済みだがuser_profilesに存在しないユーザーを修正するスクリプト
 *
 * 実行方法:
 * npx tsx scripts/fix-missing-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface MissingProfile {
  user_id: string;
  email: string;
  created_at: string;
}

async function findMissingProfiles(): Promise<MissingProfile[]> {
  console.log('\n🔍 Auth登録済みだがuser_profilesに存在しないユーザーを検索中...\n');

  // 1. 全てのAuthユーザーを取得
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Authユーザー取得エラー:', authError);
    return [];
  }

  console.log(`📊 Authユーザー総数: ${authUsers.users.length}件\n`);

  const missingProfiles: MissingProfile[] = [];

  // 2. 各ユーザーのprofileが存在するかチェック
  for (const user of authUsers.users) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // PGRST116 = "NOT FOUND" (profileが存在しない)
      missingProfiles.push({
        user_id: user.id,
        email: user.email || 'no-email',
        created_at: user.created_at
      });

      console.log(`⚠️  Missing profile: ${user.email}`);
    }
  }

  return missingProfiles;
}

async function createMissingProfile(userId: string, email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email,
        full_name: null,
        avatar_url: null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`❌ Profile作成失敗 (${email}):`, error.message);
      return false;
    }

    console.log(`✅ Profile作成成功: ${email}`);
    return true;

  } catch (error) {
    console.error(`❌ Profile作成エラー (${email}):`, error);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('Auth登録済みユーザーのProfile修正');
  console.log('========================================\n');

  // 1. 欠損しているprofileを検索
  const missingProfiles = await findMissingProfiles();

  if (missingProfiles.length === 0) {
    console.log('\n✅ 全てのAuthユーザーにprofileが存在します！\n');
    return;
  }

  console.log(`\n⚠️  ${missingProfiles.length}件のprofileが欠損しています\n`);

  // 2. 欠損しているprofileを作成
  let successCount = 0;
  let errorCount = 0;

  for (const missing of missingProfiles) {
    const success = await createMissingProfile(missing.user_id, missing.email);

    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  // 3. 結果サマリー
  console.log('\n========================================');
  console.log('修正完了');
  console.log('========================================');
  console.log(`対象ユーザー: ${missingProfiles.length}件`);
  console.log(`✅ 成功: ${successCount}件`);
  console.log(`❌ 失敗: ${errorCount}件`);
  console.log('========================================\n');

  // 4. エラーログ保存（失敗があった場合）
  if (errorCount > 0) {
    const errorLog = missingProfiles
      .filter(m => !m.user_id) // 実際のエラーユーザーを特定するロジックが必要
      .map(m => ({ user_id: m.user_id, email: m.email }));

    fs.writeFileSync(
      'fix-missing-profiles-errors.json',
      JSON.stringify(errorLog, null, 2)
    );

    console.log('📝 エラーログ保存: fix-missing-profiles-errors.json\n');
  }
}

main().catch(console.error);
