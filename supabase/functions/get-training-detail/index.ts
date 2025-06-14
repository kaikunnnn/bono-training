
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
 * キャッシュヘッダー付きレスポンス作成
 */
function createCachedResponse(data: any) {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 5分キャッシュ、CDNで10分
        'ETag': `"training-${data.slug}-${Date.now()}"` // 簡易ETag
      }
    }
  );
}

/**
 * ファイルパスからコンテンツを取得（キャッシュ最適化）
 */
async function getFileContent(supabase: any, filePath: string) {
  try {
    console.log(`[CACHE] Fetching file: ${filePath}`);
    const startTime = Date.now();
    
    const { data, error } = await supabase.storage
      .from('training-content')
      .download(filePath);
    
    if (error) {
      console.error('[ERROR] File fetch failed:', filePath, error);
      return null;
    }
    
    const text = await data.text();
    const duration = Date.now() - startTime;
    console.log(`[PERFORMANCE] File fetch took ${duration}ms for ${filePath}`);
    
    return text;
  } catch (err) {
    console.error('[ERROR] File read exception:', filePath, err);
    return null;
  }
}

/**
 * フロントマターとコンテンツを分離（強化版）
 */
function parseFrontmatter(content: string) {
  console.log(`[DEBUG] Parsing frontmatter for content length: ${content.length}`);
  
  // より柔軟な正規表現パターン（空行の有無に関係なく動作）
  const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    console.log('[DEBUG] No frontmatter found');
    return { frontmatter: {}, content };
  }
  
  const frontmatterText = match[1];
  const mainContent = match[2];
  
  console.log(`[DEBUG] Found frontmatter block: ${frontmatterText.substring(0, 100)}...`);
  
  // 強化されたYAML解析（高速化）
  const frontmatter: any = {};
  const lines = frontmatterText.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue; // 空行やコメントをスキップ
    
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let rawValue = line.substring(colonIndex + 1).trim();
    
    // マルチライン値の処理（次の行がインデントされている場合）
    while (i + 1 < lines.length && lines[i + 1].startsWith('  ')) {
      i++;
      rawValue += ' ' + lines[i].trim();
    }
    
    let value = rawValue;
    
    // クォート除去（シングル・ダブル両対応）
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // 配列の処理
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1).trim();
      if (arrayContent) {
        value = arrayContent.split(',').map((item: string) => {
          const trimmed = item.trim();
          return trimmed.replace(/^["']|["']$/g, '');
        });
      } else {
        value = [];
      }
    } 
    // 真偽値の変換
    else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } 
    // 数値の変換（ゼロパディングを避ける）
    else if (!isNaN(Number(value)) && value !== '' && !/^0[0-9]/.test(value)) {
      value = Number(value);
    }
    
    frontmatter[key] = value;
    console.log(`[DEBUG] Parsed ${key}:`, value, `(type: ${typeof value})`);
  }
  
  console.log(`[DEBUG] Final frontmatter keys:`, Object.keys(frontmatter));
  return { frontmatter, content: mainContent };
}

// メインハンドラー
serve(async (req) => {
  // CORS プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[START] Training detail request');

  try {
    let slug: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        slug = body.slug;
      } catch (e) {
        console.error('[ERROR] Request body parsing failed:', e);
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
      console.log(`[NOT_FOUND] Training not found: ${slug}`);
      return createErrorResponse('NOT_FOUND', 'トレーニングが見つかりませんでした', 404);
    }

    const { frontmatter } = parseFrontmatter(indexContent);
    
    // tasksフォルダ内のファイル一覧を取得（並列処理で高速化）
    console.log('[FETCH] Getting task list...');
    const { data: taskFiles, error: taskListError } = await supabaseAdmin.storage
      .from('training-content')
      .list(`${slug}/tasks`, { limit: 100 });

    const tasks = [];
    
    if (taskFiles && !taskListError) {
      // より堅牢な並列でタスクファイルを処理（エラーハンドリング強化）
      const taskPromises = taskFiles.map(async (taskFolder, index) => {
        if (taskFolder.name && !taskFolder.name.includes('.')) {
          try {
            const taskContentPath = `${slug}/tasks/${taskFolder.name}/content.md`;
            const taskContent = await getFileContent(supabaseAdmin, taskContentPath);
            
            if (taskContent) {
              const { frontmatter: taskMeta } = parseFrontmatter(taskContent);
              
              // デフォルト値をより堅牢に設定
              const task = {
                id: `${slug}-task-${taskMeta.order_index || index + 1}`,
                slug: taskMeta.slug || taskFolder.name,
                title: taskMeta.title || taskFolder.name, // フォルダ名をフォールバックに
                is_premium: Boolean(taskMeta.is_premium), // 確実にboolean型に
                order_index: typeof taskMeta.order_index === 'number' ? taskMeta.order_index : index + 1,
                training_id: `${slug}-1`,
                created_at: null,
                video_full: taskMeta.video_full || null,
                video_preview: taskMeta.video_preview || null,
                preview_sec: typeof taskMeta.preview_sec === 'number' ? taskMeta.preview_sec : 30,
                next_task: taskMeta.next_task || null,
                prev_task: taskMeta.prev_task || null
              };
              
              console.log(`[TASK_PARSED] Task: ${task.title} (order: ${task.order_index})`);
              return task;
            } else {
              console.warn(`[WARNING] Task content not found: ${taskContentPath}`);
              return null;
            }
          } catch (error) {
            console.error(`[ERROR] Failed to process task folder: ${taskFolder.name}`, error);
            return null;
          }
        }
        return null;
      });

      const taskResults = await Promise.all(taskPromises);
      const validTasks = taskResults.filter(task => task !== null);
      tasks.push(...validTasks);
      
      console.log(`[TASK_COUNT] Processed ${validTasks.length} valid tasks out of ${taskFiles.length} folders`);
    }

    // order_indexでソート（確実に数値としてソート）
    tasks.sort((a, b) => {
      const orderA = typeof a.order_index === 'number' ? a.order_index : 999;
      const orderB = typeof b.order_index === 'number' ? b.order_index : 999;
      return orderA - orderB;
    });

    const trainingDetail = {
      id: `${slug}-1`,
      slug: slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      type: frontmatter.type || 'challenge',
      difficulty: frontmatter.difficulty || 'normal',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      tasks: tasks,
      skills: Array.isArray(frontmatter.skills) ? frontmatter.skills : [],
      prerequisites: Array.isArray(frontmatter.prerequisites) ? frontmatter.prerequisites : [],
      has_premium_content: tasks.some(task => task.is_premium),
      thumbnailImage: frontmatter.thumbnail || 'https://source.unsplash.com/random/200x100'
    };

    const duration = Date.now() - startTime;
    console.log(`[PERFORMANCE] Total request took ${duration}ms`);
    console.log(`[SUCCESS] Training detail generated for ${slug} with ${tasks.length} tasks`);
    
    return createCachedResponse(trainingDetail);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ERROR] Server error after ${duration}ms:`, error);
    return createErrorResponse('INTERNAL_ERROR', 'サーバー内部エラーが発生しました', 500);
  }
});
