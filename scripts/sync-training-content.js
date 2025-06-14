
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 環境変数チェック:');
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ 設定済み' : '❌ 未設定'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 必要な環境変数が設定されていません:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Front-matterを解析してメタデータを抽出
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, body: content };
  }
  
  const frontmatterContent = match[1];
  const body = content.replace(frontmatterRegex, '');
  
  // 簡単なYAMLパース
  const metadata = {};
  const lines = frontmatterContent.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // クォートを削除
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // booleanの処理
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      metadata[key] = value;
    }
  }
  
  return { metadata, body };
}

/**
 * ファイルをStorage に同期
 */
async function syncFile(localPath, storagePath) {
  try {
    console.log(`📁 同期中: ${localPath} -> ${storagePath}`);
    
    // ファイル読み込み
    if (!fs.existsSync(localPath)) {
      console.error(`❌ ファイルが見つかりません: ${localPath}`);
      return false;
    }
    
    const content = fs.readFileSync(localPath, 'utf8');
    const { metadata } = parseFrontmatter(content);
    
    // メタデータ設定
    const storageMetadata = {
      is_free: !metadata.is_premium,
      difficulty: metadata.difficulty || 'normal',
      estimated_time: metadata.estimated_time || '',
      tags: JSON.stringify(metadata.tags || []),
      title: metadata.title || '',
      last_updated: new Date().toISOString()
    };
    
    console.log(`📝 メタデータ: ${JSON.stringify(storageMetadata)}`);
    
    // Storageにアップロード
    const { data, error } = await supabase.storage
      .from('training-content')
      .upload(storagePath, content, {
        contentType: 'text/markdown',
        metadata: storageMetadata,
        upsert: true
      });
    
    if (error) {
      console.error(`❌ アップロードエラー: ${storagePath}`, error);
      return false;
    }
    
    console.log(`✅ 同期完了: ${storagePath}`);
    return true;
  } catch (error) {
    console.error(`❌ ファイル処理エラー: ${localPath}`, error);
    return false;
  }
}

/**
 * ディレクトリを再帰的にスキャンして同期
 */
async function syncDirectory(localDir, storagePrefix = '') {
  console.log(`📂 ディレクトリスキャン: ${localDir}`);
  
  if (!fs.existsSync(localDir)) {
    console.error(`❌ ディレクトリが見つかりません: ${localDir}`);
    return { successCount: 0, totalCount: 0 };
  }
  
  const items = fs.readdirSync(localDir);
  let successCount = 0;
  let totalCount = 0;
  
  for (const item of items) {
    const localPath = path.join(localDir, item);
    const stat = fs.statSync(localPath);
    
    if (stat.isDirectory()) {
      // ディレクトリの場合は再帰的に処理
      const subResult = await syncDirectory(
        localPath, 
        storagePrefix ? `${storagePrefix}/${item}` : item
      );
      successCount += subResult.successCount;
      totalCount += subResult.totalCount;
    } else if (item.endsWith('.md')) {
      // Markdownファイルの場合は同期
      totalCount++;
      const storagePath = storagePrefix ? `${storagePrefix}/${item}` : item;
      const success = await syncFile(localPath, storagePath);
      if (success) successCount++;
    }
  }
  
  return { successCount, totalCount };
}

/**
 * Storage接続テスト
 */
async function testStorageConnection() {
  console.log('🧪 Storage接続テスト開始...');
  
  try {
    // バケット一覧を取得
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ バケット取得エラー:', bucketError);
      return false;
    }
    
    console.log('📦 利用可能なバケット:', buckets.map(b => b.name));
    
    // training-contentバケットの確認
    const trainingBucket = buckets.find(b => b.name === 'training-content');
    if (!trainingBucket) {
      console.error('❌ training-contentバケットが見つかりません');
      console.log('💡 マイグレーションを実行してバケットを作成してください');
      return false;
    }
    
    console.log('✅ training-contentバケットが見つかりました');
    return true;
  } catch (error) {
    console.error('❌ Storage接続テストエラー:', error);
    return false;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🚀 Training content 同期を開始します...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // Storage接続テスト
  const connectionOk = await testStorageConnection();
  if (!connectionOk) {
    console.error('❌ Storage接続に失敗しました');
    process.exit(1);
  }
  
  const contentDir = path.join(__dirname, '../content/training');
  console.log(`📁 コンテンツディレクトリ: ${contentDir}`);
  
  if (!fs.existsSync(contentDir)) {
    console.error(`❌ コンテンツディレクトリが見つかりません: ${contentDir}`);
    process.exit(1);
  }
  
  try {
    const result = await syncDirectory(contentDir);
    
    console.log('\n📊 同期結果:');
    console.log(`成功: ${result.successCount}/${result.totalCount} ファイル`);
    
    if (result.successCount === result.totalCount && result.totalCount > 0) {
      console.log('✅ すべてのファイルの同期が完了しました！');
      process.exit(0);
    } else if (result.totalCount === 0) {
      console.log('⚠️ 同期対象のMarkdownファイルが見つかりませんでした');
      process.exit(1);
    } else {
      console.log('⚠️ 一部のファイルで同期に失敗しました');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 同期処理でエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();
