
// 初期コンテンツをSupabase Storageにアップロードするスクリプト
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fryogvfhymnpiqwssmuu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(localPath, storagePath, metadata = {}) {
  try {
    const fileContent = fs.readFileSync(localPath, 'utf8');
    const blob = new Blob([fileContent], { type: 'text/markdown' });
    
    const { data, error } = await supabase.storage
      .from('training-content')
      .upload(storagePath, blob, {
        cacheControl: '3600',
        upsert: true,
        metadata
      });

    if (error) {
      console.error(`アップロードエラー (${storagePath}):`, error);
      return false;
    }

    console.log(`✅ アップロード成功: ${storagePath}`);
    return true;
  } catch (err) {
    console.error(`ファイル読み込みエラー (${localPath}):`, err);
    return false;
  }
}

async function main() {
  console.log('初期コンテンツのアップロードを開始...');

  // todo-app training
  const todoAppFiles = [
    {
      local: 'content/training/todo-app/index.md',
      storage: 'todo-app/index.md',
      metadata: { is_free: 'true', content_type: 'training_overview' }
    },
    {
      local: 'content/training/todo-app/tasks/introduction/content.md',
      storage: 'todo-app/tasks/introduction/content.md',
      metadata: { is_free: 'true', content_type: 'task', is_premium: 'false' }
    },
    {
      local: 'content/training/todo-app/tasks/ui-layout-basic01/content.md',
      storage: 'todo-app/tasks/ui-layout-basic01/content.md',
      metadata: { is_free: 'false', content_type: 'task', is_premium: 'true' }
    }
  ];

  let successCount = 0;
  let totalCount = todoAppFiles.length;

  for (const file of todoAppFiles) {
    const success = await uploadFile(file.local, file.storage, file.metadata);
    if (success) {
      successCount++;
    }
    // 短い間隔でアップロード
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\nアップロード完了: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('✅ すべてのファイルが正常にアップロードされました');
  } else {
    console.log('⚠️  一部のファイルでエラーが発生しました');
  }
}

main().catch(console.error);
