import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// シンプルなYAML frontmatterパーサー
function parseFrontmatter(text: string) {
  const result: Record<string, any> = {};
  const lines = text.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const [_, key, valueStr] = match;
      const trimmedKey = key.trim();
      let value: any = valueStr.trim();

      // クォート削除
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // 真偽値の変換
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // 数値の変換
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      // 配列の変換
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch (e) {
          // パースに失敗した場合は文字列のまま
        }
      }

      result[trimmedKey] = value;
    }
  }
  return result;
}

async function testStorageAccess(supabase, trainingSlug: string) {
  try {
    console.log(`=== Storage アクセステスト開始 (${trainingSlug}) ===`);
    
    // 1. training フォルダの確認
    console.log('1. training フォルダの確認...');
    const { data: trainingFiles, error: trainingError } = await supabase
      .storage
      .from('content')
      .list('training', { limit: 100 });
    
    if (trainingError) {
      console.error('training フォルダアクセスエラー:', trainingError);
      return false;
    }
    
    console.log('training フォルダ内容:', trainingFiles?.map(f => f.name));
    
    // 2. 指定されたトレーニングフォルダの確認
    console.log(`2. ${trainingSlug} フォルダの確認...`);
    const trainingExists = trainingFiles?.some(f => f.name === trainingSlug);
    if (!trainingExists) {
      console.error(`${trainingSlug} フォルダが見つかりません`);
      console.log(`利用可能なトレーニング:`, trainingFiles?.map(f => f.name));
      return false;
    }
    
    // 3. トレーニングフォルダ内容の確認
    console.log(`3. ${trainingSlug} フォルダ内容の確認...`);
    const { data: folderContents, error: folderError } = await supabase
      .storage
      .from('content')
      .list(`training/${trainingSlug}`, { limit: 100 });
    
    if (folderError) {
      console.error(`${trainingSlug} フォルダ内容取得エラー:`, folderError);
      return false;
    }
    
    console.log(`${trainingSlug} フォルダ内のファイル:`, folderContents?.map(f => f.name));
    
    return true;
  } catch (error) {
    console.error('Storage アクセステスト中にエラー:', error);
    return false;
  }
}

async function getTrainingWithTasks(supabase, trainingSlug: string) {
  try {
    console.log(`=== トレーニング詳細取得開始: ${trainingSlug} ===`);
    
    // まずStorage接続テストを実行
    const storageAccessOk = await testStorageAccess(supabase, trainingSlug);
    if (!storageAccessOk) {
      console.error('Storage アクセステストに失敗しました');
      throw new Error(`トレーニング「${trainingSlug}」へのアクセスに失敗しました`);
    }
    
    // トレーニングのindex.mdを取得
    const indexPath = `training/${trainingSlug}/index.md`;
    console.log(`index.mdパス: ${indexPath}`);
    
    const { data: indexData, error: indexError } = await supabase
      .storage
      .from('content')
      .download(indexPath);

    if (indexError) {
      console.error('index.md取得エラー:', indexError);
      console.error('index.md エラー詳細:', JSON.stringify(indexError, null, 2));
      throw new Error(`トレーニング「${trainingSlug}」が見つかりません`);
    }

    const indexContent = await indexData.text();
    console.log('index.mdコンテンツ取得成功:', indexContent.slice(0, 100) + '...');
    
    const indexMatch = indexContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!indexMatch) {
      console.error('index.mdのフロントマター形式が不正です');
      console.log('index.mdコンテンツ冒頭:', indexContent.slice(0, 200));
      throw new Error('index.mdのフロントマター形式が不正です');
    }

    const [_, frontmatterText, description] = indexMatch;
    const frontmatter = parseFrontmatter(frontmatterText);
    console.log('front-matter解析結果:', frontmatter);

    // タスクフォルダ一覧を取得
    const tasksPath = `training/${trainingSlug}/tasks`;
    console.log(`タスクフォルダパス: ${tasksPath}`);
    
    const { data: taskFolders, error: taskListError } = await supabase
      .storage
      .from('content')
      .list(tasksPath, { sortBy: { column: 'name', order: 'asc' } });

    if (taskListError) {
      console.error('タスクフォルダ取得エラー:', taskListError);
      console.error('タスクフォルダエラー詳細:', JSON.stringify(taskListError, null, 2));
      // タスクがなくてもトレーニング情報は返す
    }

    console.log('取得したタスクフォルダ数:', taskFolders?.length || 0);
    console.log('取得したタスクフォルダ:', taskFolders?.map(f => ({ name: f.name, id: f.id })));
    const tasks = [];

    if (taskFolders && taskFolders.length > 0) {
      console.log(`${taskFolders.length}個のタスクフォルダを処理開始`);
      
      // 各タスクフォルダのcontent.mdを読み込む
      for (const folder of taskFolders) {
        // フォルダのみを処理（ファイルは除外）
        if (!folder.id || folder.id.includes('.')) {
          console.log(`スキップ（ファイル）: ${folder.name}`);
          continue;
        }

        const taskSlug = folder.name;
        console.log(`=== タスク処理開始: ${taskSlug} ===`);
        
        try {
          // content.mdのパス
          const taskPath = `training/${trainingSlug}/tasks/${taskSlug}/content.md`;
          console.log(`タスクコンテンツパス: ${taskPath}`);
          
          const { data: taskData, error: taskError } = await supabase
            .storage
            .from('content')
            .download(taskPath);

          if (taskError) {
            console.warn(`タスク ${taskSlug} のcontent.md取得エラー:`, taskError);
            console.warn('タスクエラー詳細:', JSON.stringify(taskError, null, 2));
            continue;
          }

          const taskContent = await taskData.text();
          console.log(`タスク ${taskSlug} コンテンツ取得成功:`, taskContent.slice(0, 100) + '...');
          
          const taskMatch = taskContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
          
          if (!taskMatch) {
            console.warn(`タスク ${taskSlug} のフロントマター形式が不正です`);
            console.log(`${taskSlug} コンテンツ冒頭:`, taskContent.slice(0, 200));
            continue;
          }

          const [_, taskFrontmatterText] = taskMatch;
          const taskFrontmatter = parseFrontmatter(taskFrontmatterText);
          console.log(`タスク ${taskSlug} front-matter:`, taskFrontmatter);

          tasks.push({
            slug: taskSlug,
            title: taskFrontmatter.title || taskSlug,
            is_premium: taskFrontmatter.is_premium || false,
            order_index: taskFrontmatter.order_index || 999,
            difficulty: taskFrontmatter.difficulty || 'normal',
            estimated_time: taskFrontmatter.estimated_time || '',
            video_full: taskFrontmatter.video_full || null,
            video_preview: taskFrontmatter.video_preview || null,
            preview_sec: taskFrontmatter.preview_sec || 30
          });

          console.log(`✓ タスク ${taskSlug} 処理完了`);

        } catch (error) {
          console.warn(`タスク ${taskSlug} の処理エラー:`, error);
          console.error('タスク処理エラー詳細:', JSON.stringify(error, null, 2));
          continue;
        }
      }
    }

    // order_indexでソート
    tasks.sort((a, b) => a.order_index - b.order_index);
    console.log(`=== 最終的なタスク数: ${tasks.length} ===`);

    const result = {
      slug: trainingSlug,
      title: frontmatter.title || trainingSlug,
      description: frontmatter.description || description.trim(),
      type: frontmatter.type || 'skill',
      difficulty: frontmatter.difficulty || '初級',
      tags: frontmatter.tags || [],
      thumbnailImage: frontmatter.thumbnailImage || 'https://source.unsplash.com/random/200x100',
      estimated_total_time: frontmatter.estimated_total_time || '',
      task_count: tasks.length,
      tasks
    };

    console.log('=== 最終結果 ===:', result);
    return result;

  } catch (error) {
    console.error('=== トレーニング詳細取得エラー ===');
    console.error('エラーメッセージ:', error.message);
    console.error('エラー詳細:', JSON.stringify(error, null, 2));
    throw error;
  }
}

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('=== get-training-detail API呼び出し開始 ===');
    
    const url = new URL(req.url);
    const trainingSlug = url.searchParams.get('slug');
    
    console.log('リクエストされたslug:', trainingSlug);
    
    if (!trainingSlug) {
      return new Response(
        JSON.stringify({ error: 'Training slug is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key 設定状況:', supabaseServiceKey ? '設定済み' : '未設定');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const trainingDetail = await getTrainingWithTasks(supabase, trainingSlug);
    
    console.log('=== API レスポンス送信 ===');
    console.log('送信するトレーニング詳細:', trainingDetail.title);
    
    return new Response(
      JSON.stringify(trainingDetail),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('=== トレーニング詳細取得エラー ===');
    console.error('エラーメッセージ:', error.message);
    console.error('エラー詳細:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'トレーニング詳細の取得に失敗しました' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
