
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

async function getAllTrainings(supabase) {
  try {
    console.log('トレーニング一覧取得開始');
    
    // training フォルダ一覧を取得（パス修正）
    const trainingPath = 'training';
    console.log(`トレーニングフォルダパス: ${trainingPath}`);
    
    const { data: folders, error } = await supabase
      .storage
      .from('content')
      .list(trainingPath, { sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error('フォルダ一覧取得エラー:', error);
      throw new Error('トレーニング一覧の取得に失敗しました');
    }

    console.log('取得したフォルダ:', folders);

    if (!folders || folders.length === 0) {
      console.log('フォルダが見つかりません');
      return [];
    }

    const trainings = [];

    // 各フォルダのindex.mdファイルを読み込む
    for (const folder of folders) {
      // フォルダのみを処理（ファイルは除外）
      if (!folder.id || folder.id.includes('.')) {
        console.log(`スキップ（ファイル）: ${folder.name}`);
        continue;
      }

      const slug = folder.name;
      console.log(`トレーニング処理開始: ${slug}`);
      
      try {
        // パス修正：index.mdのパス
        const filePath = `training/${slug}/index.md`;
        console.log(`index.mdパス: ${filePath}`);
        
        // ファイル存在確認
        const { data: files, error: listError } = await supabase
          .storage
          .from('content')
          .list(`training/${slug}`);

        if (listError || !files || !files.some(file => file.name === 'index.md')) {
          console.warn(`トレーニング ${slug} のindex.mdが見つかりません`);
          continue;
        }

        // ファイル内容取得
        const { data, error: downloadError } = await supabase
          .storage
          .from('content')
          .download(filePath);

        if (downloadError) {
          console.warn(`トレーニング ${slug} のファイル取得エラー:`, downloadError);
          continue;
        }

        const content = await data.text();
        console.log(`トレーニング ${slug} コンテンツ取得成功:`, content.slice(0, 100) + '...');
        
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (!frontmatterMatch) {
          console.warn(`トレーニング ${slug} のフロントマター形式が不正です`);
          continue;
        }

        const [_, frontmatterText, mdContent] = frontmatterMatch;
        const frontmatter = parseFrontmatter(frontmatterText);
        console.log(`トレーニング ${slug} front-matter:`, frontmatter);

        trainings.push({
          slug,
          title: frontmatter.title || slug,
          description: frontmatter.description || mdContent.trim().split('\n')[0] || '',
          type: frontmatter.type || 'skill',
          difficulty: frontmatter.difficulty || '初級',
          tags: frontmatter.tags || [],
          thumbnailImage: frontmatter.thumbnailImage || 'https://source.unsplash.com/random/200x100',
          estimated_total_time: frontmatter.estimated_total_time || '',
          task_count: frontmatter.task_count || 0
        });

      } catch (error) {
        console.warn(`トレーニング ${slug} の処理エラー:`, error);
        continue;
      }
    }

    console.log(`最終的なトレーニング数: ${trainings.length}`);
    console.log('最終結果:', trainings);
    return trainings;
  } catch (error) {
    console.error('全トレーニング取得エラー:', error);
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
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const trainings = await getAllTrainings(supabase);
    
    return new Response(
      JSON.stringify(trainings),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('トレーニング一覧取得エラー:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'トレーニング一覧の取得に失敗しました' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
