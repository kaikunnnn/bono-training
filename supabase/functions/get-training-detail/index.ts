
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 統一エラーレスポンス作成
 */
function createErrorResponse(code: string, message: string, statusCode: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code, message }
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * 成功レスポンス作成
 */
function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * デバッグ用ログ出力関数
 */
function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * ファイルパスからコンテンツを取得
 */
async function getFileContent(supabase: any, filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from('training-content')
      .download(filePath);
    
    if (error) {
      console.error('ファイル取得エラー:', error);
      return null;
    }
    
    const text = await data.text();
    return text;
  } catch (err) {
    console.error('ファイル読み込みエラー:', err);
    return null;
  }
}

/**
 * フロントマターとコンテンツを分離
 */
function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  const frontmatterText = match[1];
  const mainContent = match[2];
  
  // 簡易YAML解析
  const frontmatter: any = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      
      // 配列の処理
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      }
      
      frontmatter[key] = value;
    }
  });
  
  return { frontmatter, content: mainContent };
}

// メインハンドラー
serve(async (req) => {
  // CORS プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug('トレーニング詳細取得リクエスト受信');

    let slug: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        logDebug('リクエストボディ:', body);
        slug = body.slug;
      } catch (e) {
        console.error('リクエストボディ解析エラー:', e);
        return createErrorResponse('INVALID_REQUEST', 'リクエストボディの解析に失敗しました', 400);
      }
    }

    if (!slug) {
      return createErrorResponse('INVALID_REQUEST', 'slugが指定されていません', 400);
    }

    // Supabase クライアントを初期化
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // トレーニングのindex.mdを取得
    const indexPath = `${slug}/index.md`;
    const indexContent = await getFileContent(supabaseAdmin, indexPath);
    
    if (!indexContent) {
      return createErrorResponse('NOT_FOUND', 'トレーニングが見つかりませんでした', 404);
    }

    const { frontmatter } = parseFrontmatter(indexContent);
    
    // tasksフォルダ内のファイル一覧を取得
    const { data: taskFiles, error: taskListError } = await supabaseAdmin.storage
      .from('training-content')
      .list(`${slug}/tasks`, { limit: 100 });

    const tasks = [];
    
    if (taskFiles && !taskListError) {
      for (const taskFolder of taskFiles) {
        if (taskFolder.name && !taskFolder.name.includes('.')) {
          const taskContentPath = `${slug}/tasks/${taskFolder.name}/content.md`;
          const taskContent = await getFileContent(supabaseAdmin, taskContentPath);
          
          if (taskContent) {
            const { frontmatter: taskMeta } = parseFrontmatter(taskContent);
            
            tasks.push({
              id: `${slug}-task-${taskMeta.order_index || tasks.length + 1}`,
              slug: taskMeta.slug || taskFolder.name,
              title: taskMeta.title || taskFolder.name,
              is_premium: taskMeta.is_premium || false,
              order_index: taskMeta.order_index || tasks.length + 1,
              training_id: `${slug}-1`,
              created_at: null,
              video_full: taskMeta.video_full || null,
              video_preview: taskMeta.video_preview || null,
              preview_sec: taskMeta.preview_sec || 30,
              next_task: taskMeta.next_task || null,
              prev_task: taskMeta.prev_task || null
            });
          }
        }
      }
    }

    // order_indexでソート
    tasks.sort((a, b) => a.order_index - b.order_index);

    const trainingDetail = {
      id: `${slug}-1`,
      slug: slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      type: frontmatter.type || 'challenge',
      difficulty: frontmatter.difficulty || 'normal',
      tags: frontmatter.tags || [],
      tasks: tasks,
      skills: frontmatter.skills || [],
      prerequisites: frontmatter.prerequisites || [],
      has_premium_content: tasks.some(task => task.is_premium),
      thumbnailImage: frontmatter.thumbnail || 'https://source.unsplash.com/random/200x100'
    };

    logDebug('パースされたトレーニング詳細:', trainingDetail);
    
    return createSuccessResponse(trainingDetail);
    
  } catch (error) {
    console.error('サーバーエラー:', error);
    return createErrorResponse('INTERNAL_ERROR', 'サーバー内部エラーが発生しました', 500);
  }
});
