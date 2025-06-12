
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
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
  
  // 簡単なYAMLパースと
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
    console.log(`同期中: ${localPath} -> ${storagePath}`);
    
    // ファイル読み込み
    const content = fs.readFileSync(localPath, 'utf8');
    const { metadata } = parseFrontmatter(content);
    
    // メタデータ設定
    const storageMetadata = {
      is_free: !metadata.is_premium,
      difficulty: metadata.difficulty || 'normal',
      estimated_time: metadata.estimated_time || '',
      tags: JSON.stringify(metadata.tags || []),
      last_updated: new Date().toISOString()
    };
    
    // Storageにアップロード
    const { data, error } = await supabase.storage
      .from('training-content')
      .upload(storagePath, content, {
        contentType: 'text/markdown',
        metadata: storageMetadata,
        upsert: true
      });
    
    if (error) {
      console.error(`エラー: ${storagePath}`, error);
      return false;
    }
    
    console.log(`✅ 同期完了: ${storagePath}`);
    return true;
  } catch (error) {
    console.error(`ファイル処理エラー: ${localPath}`, error);
    return false;
  }
}

/**
 * ディレクトリを再帰的にスキャンして同期
 */
async function syncDirectory(localDir, storagePrefix = '') {
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
 * メイン実行関数
 */
async function main() {
  console.log('🚀 Training content 同期を開始します...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  const contentDir = path.join(__dirname, '../content/training');
  
  if (!fs.existsSync(contentDir)) {
    console.error(`コンテンツディレクトリが見つかりません: ${contentDir}`);
    process.exit(1);
  }
  
  try {
    const result = await syncDirectory(contentDir);
    
    console.log('\n📊 同期結果:');
    console.log(`成功: ${result.successCount}/${result.totalCount} ファイル`);
    
    if (result.successCount === result.totalCount) {
      console.log('✅ すべてのファイルの同期が完了しました！');
      process.exit(0);
    } else {
      console.log('⚠️ 一部のファイルで同期に失敗しました');
      process.exit(1);
    }
  } catch (error) {
    console.error('同期処理でエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();
