
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

async function testStorageAccess(supabase) {
  try {
    console.log('=== Storage アクセステスト開始 ===');
    
    // 1. content バケットの存在確認
    console.log('1. content バケットの存在確認...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('バケット一覧取得エラー:', bucketsError);
      return false;
    }
    
    console.log('利用可能なバケット:', buckets?.map(b => b.name));
    const contentBucket = buckets?.find(b => b.name === 'content');
    if (!contentBucket) {
      console.error('content バケットが見つかりません');
      return false;
    }
    console.log('✓ content バケット確認完了');

    // 2. ルートディレクトリの確認
    console.log('2. content バケットのルートディレクトリ確認...');
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('content')
      .list('', { limit: 100 });
    
    if (rootError) {
      console.error('ルートディレクトリアクセスエラー:', rootError);
      return false;
    }
    
    console.log('ルートディレクトリの内容:', rootFiles?.map(f => ({ name: f.name, id: f.id })));
    
    // 3. training フォルダの確認
    console.log('3. training フォルダの確認...');
    const trainingExists = rootFiles?.some(f => f.name === 'training');
    if (!trainingExists) {
      console.error('training フォルダが見つかりません');
      return false;
    }
    console.log('✓ training フォルダ確認完了');
    
    return true;
  } catch (error) {
    console.error('Storage アクセステスト中にエラー:', error);
    return false;
  }
}

async function getAllTrainings(supabase) {
  try {
    console.log('=== トレーニング一覧取得開始 ===');
    
    // まずStorage接続テストを実行
    const storageAccessOk = await testStorageAccess(supabase);
    if (!storageAccessOk) {
      console.error('Storage アクセステストに失敗しました');
      return [];
    }
    
    // training フォルダ一覧を取得
    const trainingPath = 'training';
    console.log(`4. トレーニングフォルダ内容取得: ${trainingPath}`);
    
    const { data: folders, error } = await supabase
      .storage
      .from('content')
      .list(trainingPath, { sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error('フォルダ一覧取得エラー:', error);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      throw new Error('トレーニング一覧の取得に失敗しました');
    }

    console.log('取得したフォルダ数:', folders?.length || 0);
    console.log('取得したフォルダ詳細:', folders?.map(f => ({ 
      name: f.name, 
      id: f.id,
      metadata: f.metadata,
      created_at: f.created_at,
      updated_at: f.updated_at
    })));

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
      console.log(`=== トレーニング処理開始: ${slug} ===`);
      
      try {
        // パス修正：index.mdのパス
        const filePath = `training/${slug}/index.md`;
        console.log(`index.mdパス: ${filePath}`);
        
        // ファイル存在確認
        console.log(`${slug} フォルダ内容確認中...`);
        const { data: files, error: listError } = await supabase
          .storage
          .from('content')
          .list(`training/${slug}`);

        if (listError) {
          console.error(`${slug} フォルダアクセスエラー:`, listError);
          console.error('エラー詳細:', JSON.stringify(listError, null, 2));
          continue;
        }

        console.log(`${slug} フォルダ内のファイル:`, files?.map(f => f.name));

        if (!files || !files.some(file => file.name === 'index.md')) {
          console.warn(`トレーニング ${slug} のindex.mdが見つかりません`);
          console.log(`${slug} 内の利用可能ファイル:`, files?.map(f => f.name));
          continue;
        }

        // ファイル内容取得
        console.log(`${slug} のindex.md取得中...`);
        const { data, error: downloadError } = await supabase
          .storage
          .from('content')
          .download(filePath);

        if (downloadError) {
          console.error(`トレーニング ${slug} のファイル取得エラー:`, downloadError);
          console.error('ダウンロードエラー詳細:', JSON.stringify(downloadError, null, 2));
          continue;
        }

        const content = await data.text();
        console.log(`トレーニング ${slug} コンテンツ取得成功:`, content.slice(0, 100) + '...');
        
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (!frontmatterMatch) {
          console.warn(`トレーニング ${slug} のフロントマター形式が不正です`);
          console.log(`${slug} のコンテンツ冒頭:`, content.slice(0, 200));
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

        console.log(`✓ トレーニング ${slug} 処理完了`);

      } catch (error) {
        console.warn(`トレーニング ${slug} の処理エラー:`, error);
        console.error('詳細エラー:', JSON.stringify(error, null, 2));
        continue;
      }
    }

    console.log(`=== 最終的なトレーニング数: ${trainings.length} ===`);
    console.log('最終結果:', trainings);
    return trainings;
  } catch (error) {
    console.error('全トレーニング取得エラー:', error);
    console.error('全体エラー詳細:', JSON.stringify(error, null, 2));
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
    console.log('=== get-training-list API呼び出し開始 ===');
    
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key 設定状況:', supabaseServiceKey ? '設定済み' : '未設定');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const trainings = await getAllTrainings(supabase);
    
    console.log('=== API レスポンス送信 ===');
    console.log('送信するトレーニング数:', trainings.length);
    
    return new Response(
      JSON.stringify(trainings),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('=== トレーニング一覧取得エラー ===');
    console.error('エラーメッセージ:', error.message);
    console.error('エラー詳細:', JSON.stringify(error, null, 2));
    
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
