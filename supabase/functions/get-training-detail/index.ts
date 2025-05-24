
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

async function getTrainingWithTasks(supabase, trainingSlug: string) {
  try {
    // トレーニングのindex.mdを取得
    const indexPath = `content/training/${trainingSlug}/index.md`;
    
    const { data: indexData, error: indexError } = await supabase
      .storage
      .from('content')
      .download(indexPath);

    if (indexError) {
      console.error('index.md取得エラー:', indexError);
      throw new Error(`トレーニング「${trainingSlug}」が見つかりません`);
    }

    const indexContent = await indexData.text();
    const indexMatch = indexContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!indexMatch) {
      throw new Error('index.mdのフロントマター形式が不正です');
    }

    const [_, frontmatterText, description] = indexMatch;
    const frontmatter = parseFrontmatter(frontmatterText);

    // タスクフォルダ一覧を取得
    const { data: taskFolders, error: taskListError } = await supabase
      .storage
      .from('content')
      .list(`content/training/${trainingSlug}/tasks`, { sortBy: { column: 'name', order: 'asc' } });

    if (taskListError) {
      console.error('タスクフォルダ取得エラー:', taskListError);
      // タスクがなくてもトレーニング情報は返す
    }

    const tasks = [];

    if (taskFolders && taskFolders.length > 0) {
      // 各タスクフォルダのcontent.mdを読み込む
      for (const folder of taskFolders) {
        if (!folder.id || !folder.id.endsWith('/')) continue;

        const taskSlug = folder.name;
        try {
          const taskPath = `content/training/${trainingSlug}/tasks/${taskSlug}/content.md`;
          
          const { data: taskData, error: taskError } = await supabase
            .storage
            .from('content')
            .download(taskPath);

          if (taskError) {
            console.warn(`タスク ${taskSlug} のcontent.md取得エラー:`, taskError);
            continue;
          }

          const taskContent = await taskData.text();
          const taskMatch = taskContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
          
          if (!taskMatch) {
            console.warn(`タスク ${taskSlug} のフロントマター形式が不正です`);
            continue;
          }

          const [_, taskFrontmatterText] = taskMatch;
          const taskFrontmatter = parseFrontmatter(taskFrontmatterText);

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

        } catch (error) {
          console.warn(`タスク ${taskSlug} の処理エラー:`, error);
          continue;
        }
      }
    }

    // order_indexでソート
    tasks.sort((a, b) => a.order_index - b.order_index);

    return {
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

  } catch (error) {
    console.error('トレーニング詳細取得エラー:', error);
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
    const url = new URL(req.url);
    const trainingSlug = url.searchParams.get('slug');
    
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const trainingDetail = await getTrainingWithTasks(supabase, trainingSlug);
    
    return new Response(
      JSON.stringify(trainingDetail),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('トレーニング詳細取得エラー:', error);
    
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
