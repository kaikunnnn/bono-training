
import { createClient } from '@supabase/supabase-js';

// Supabase設定（テスト用）
const supabaseUrl = 'https://fryogvfhymnpiqwssmuu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 環境変数チェック:');
console.log(`Service Key: ${supabaseServiceKey ? '✅ 設定済み' : '❌ 未設定'}`);

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Storageバケットの確認とテストファイルのアップロード
 */
async function testStorage() {
  console.log('🧪 Storage接続テストを開始...');
  
  try {
    // バケット一覧を取得
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ バケット取得エラー:', bucketError);
      return;
    }
    
    console.log('📦 利用可能なバケット:', buckets.map(b => b.name));
    
    // training-contentバケットの確認
    const trainingBucket = buckets.find(b => b.name === 'training-content');
    if (!trainingBucket) {
      console.error('❌ training-contentバケットが見つかりません');
      console.log('💡 以下のSQLを実行してバケットを作成してください:');
      console.log('INSERT INTO storage.buckets (id, name, public) VALUES (\'training-content\', \'training-content\', false);');
      return;
    }
    
    console.log('✅ training-contentバケットが見つかりました');
    
    // テストファイルをアップロード
    const testContent = `---
title: "テストファイル"
is_premium: false
difficulty: "easy"
---

# テストコンテンツ

これはStorage接続テスト用のファイルです。
現在時刻: ${new Date().toISOString()}
`;
    
    const { data, error } = await supabase.storage
      .from('training-content')
      .upload('test/test-file.md', testContent, {
        contentType: 'text/markdown',
        metadata: {
          is_free: true,
          test: true,
          uploaded_at: new Date().toISOString()
        },
        upsert: true
      });
    
    if (error) {
      console.error('❌ テストファイルアップロードエラー:', error);
      return;
    }
    
    console.log('✅ テストファイルのアップロードが成功しました:', data);
    
    // ファイル一覧の確認
    const { data: files, error: listError } = await supabase.storage
      .from('training-content')
      .list('test');
    
    if (listError) {
      console.error('❌ ファイル一覧取得エラー:', listError);
      return;
    }
    
    console.log('📁 テストディレクトリのファイル:', files);
    
    // ファイル取得テスト
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('training-content')
      .download('test/test-file.md');
    
    if (downloadError) {
      console.error('❌ ファイル取得エラー:', downloadError);
      return;
    }
    
    const downloadedContent = await downloadData.text();
    console.log('📄 ダウンロードしたファイル内容（先頭100文字）:');
    console.log(downloadedContent.substring(0, 100) + '...');
    
    console.log('\n🎉 すべてのテストが成功しました！');
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

// テスト実行
testStorage();
