
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    logDebug('トレーニング一覧取得リクエスト受信');

    // Supabase クライアントを初期化
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // training-content バケットのファイル一覧を取得
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('training-content')
      .list('', { limit: 100 });

    if (listError) {
      console.error('ファイル一覧取得エラー:', listError);
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'ファイル一覧の取得に失敗しました'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    logDebug('取得したファイル一覧:', files);

    // 各トレーニングフォルダのindex.mdを読み込み
    const trainings = [];
    
    for (const file of files || []) {
      if (file.name && !file.name.includes('.')) {
        // フォルダの場合、index.mdを取得
        const indexPath = `${file.name}/index.md`;
        const content = await getFileContent(supabaseAdmin, indexPath);
        
        if (content) {
          const { frontmatter } = parseFrontmatter(content);
          
          trainings.push({
            id: `${file.name}-1`,
            slug: file.name,
            title: frontmatter.title || file.name,
            description: frontmatter.description || '',
            type: frontmatter.type || 'challenge',
            difficulty: frontmatter.difficulty || 'normal',
            tags: frontmatter.tags || [],
            thumbnailImage: frontmatter.thumbnail || 'https://source.unsplash.com/random/200x100'
          });
        }
      }
    }

    logDebug('パースされたトレーニング一覧:', trainings);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: trainings
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('サーバーエラー:', error);
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'サーバー内部エラーが発生しました'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
