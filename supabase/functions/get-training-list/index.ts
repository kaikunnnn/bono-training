
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
function createErrorResponse(statusCode: number, code: string, message: string, details?: any) {
  console.error(`[ERROR] ${code}: ${message}`, details || '');
  return new Response(
    JSON.stringify({ 
      success: false,
      error: {
        code,
        message,
        statusCode,
        details: details || null
      }
    }),
    { 
      status: statusCode, 
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
      // ストレージエラーの詳細分類
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.error('ファイル未発見:', filePath, error);
        return { success: false, errorCode: 'NOT_FOUND', error };
      }
      if (error.message?.includes('permission') || error.message?.includes('403')) {
        console.error('権限エラー:', filePath, error);
        return { success: false, errorCode: 'FORBIDDEN', error };
      }
      console.error('ストレージエラー:', filePath, error);
      return { success: false, errorCode: 'STORAGE_ERROR', error };
    }
    
    const text = await data.text();
    return { success: true, content: text };
  } catch (err) {
    console.error('ファイル読み込み例外:', filePath, err);
    return { success: false, errorCode: 'INTERNAL_ERROR', error: err };
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
    logDebug('トレーニング一覧取得リクエスト受信');

    // Supabase クライアントを初期化
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    if (!supabaseAdmin) {
      return createErrorResponse(500, 'CONFIG_ERROR', 'Supabase設定エラー');
    }
    
    // training-content バケットのファイル一覧を取得
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('training-content')
      .list('', { limit: 100 });

    if (listError) {
      console.error('ファイル一覧取得エラー:', listError);
      
      if (listError.message?.includes('permission') || listError.message?.includes('403')) {
        return createErrorResponse(403, 'FORBIDDEN', 'ストレージアクセス権限がありません', { originalError: listError.message });
      }
      
      return createErrorResponse(500, 'STORAGE_LIST_ERROR', 'ファイル一覧の取得に失敗しました', { originalError: listError.message });
    }

    if (!files || files.length === 0) {
      return createErrorResponse(404, 'NO_CONTENT', 'トレーニングコンテンツが見つかりませんでした');
    }

    logDebug('取得したファイル一覧:', files);

    // 各トレーニングフォルダのindex.mdを読み込み
    const trainings = [];
    
    for (const file of files) {
      if (file.name && !file.name.includes('.')) {
        // フォルダの場合、index.mdを取得
        const indexPath = `${file.name}/index.md`;
        const result = await getFileContent(supabaseAdmin, indexPath);
        
        if (result.success && result.content) {
          const { frontmatter } = parseFrontmatter(result.content);
          
          trainings.push({
            id: `${file.name}-1`,
            slug: file.name,
            title: frontmatter.title || file.name,
            description: frontmatter.description || '',
            type: frontmatter.type || 'challenge',
            difficulty: frontmatter.difficulty || 'normal',
            tags: frontmatter.tags || [],
            icon: frontmatter.icon || null,
            category: frontmatter.category || null,
            thumbnailImage: frontmatter.thumbnail || 'https://source.unsplash.com/random/200x100'
          });
        } else {
          console.warn(`トレーニング ${file.name} のindex.mdが読み込めませんでした:`, result.error);
        }
      }
    }

    if (trainings.length === 0) {
      return createErrorResponse(404, 'NO_VALID_CONTENT', '有効なトレーニングコンテンツが見つかりませんでした');
    }

    logDebug('パースされたトレーニング一覧:', trainings);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: trainings,
        meta: {
          total: trainings.length,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('予期しないサーバーエラー:', error);
    return createErrorResponse(500, 'INTERNAL_ERROR', 'サーバー内部エラーが発生しました', { 
      message: error instanceof Error ? error.message : '不明なエラー'
    });
  }
});
