
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

      // 真偽値の変換
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // 数値の変換
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      // 配列の変換 (簡易実装: ["value1", "value2"] 形式のみ対応)
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

async function getTrainingMetaFromStorage(supabase, trainingSlug?: string) {
  try {
    // 特定のトレーニングが指定されている場合
    if (trainingSlug) {
      // 新しいパスを優先的に確認
      const filePath = `content/training/${trainingSlug}/meta.md`;
      
      // ファイルの存在確認
      const { data: existsData, error: existsError } = await supabase
        .storage
        .from('content')
        .list(`content/training/${trainingSlug}`);

      // 新しいパスで見つからなかった場合のエラーログ
      if (existsError || !existsData || existsData.length === 0 || !existsData.some(file => file.name === 'meta.md')) {
        console.log(`新しいパス ${filePath} にメタファイルが見つかりません`);
        throw new Error('トレーニングのメタデータが見つかりません');
      }

      // ファイル内容の取得
      const { data, error } = await supabase
        .storage
        .from('content')
        .download(filePath);

      if (error) {
        console.error('ファイル取得エラー:', error);
        throw new Error('ファイルの取得に失敗しました');
      }

      // ファイル内容をテキストに変換
      const content = await data.text();

      // front matterと本文を分離
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        throw new Error('正しいフロントマター形式ではありません');
      }

      const [_, frontmatterText, mdContent] = frontmatterMatch;
      const frontmatter = parseFrontmatter(frontmatterText);
      
      return {
        ...frontmatter,
        slug: trainingSlug,
        description: frontmatter.description || mdContent.trim().split('\n')[0],
        thumbnailImage: frontmatter.thumbnailImage || 'https://source.unsplash.com/random/200x100'
      };
    } 
    // 全トレーニングの一覧を取得する場合
    else {
      // 新しいパスでのフォルダ一覧取得
      const { data: folders, error } = await supabase
        .storage
        .from('content')
        .list('content/training', { sortBy: { column: 'name', order: 'asc' } });

      if (error) {
        console.error('フォルダ一覧取得エラー:', error);
        throw new Error('トレーニング一覧の取得に失敗しました');
      }

      if (!folders || folders.length === 0) {
        return [];
      }

      const trainings = [];

      // 各フォルダのmeta.mdファイルを読み込む
      for (const folder of folders) {
        if (!folder.id.endsWith('/')) continue; // フォルダのみ処理

        const slug = folder.name;
        try {
          const meta = await getTrainingMetaFromStorage(supabase, slug);
          trainings.push(meta);
        } catch (error) {
          console.warn(`トレーニング ${slug} のメタデータ取得エラー:`, error);
          // エラーが発生しても続行
        }
      }

      return trainings;
    }
  } catch (error) {
    console.error('ストレージからのメタデータ取得エラー:', error);
    throw error;
  }
}

async function getTrainingTaskList(supabase, trainingSlug: string) {
  try {
    // トレーニングフォルダ内のタスクディレクトリを列挙
    const { data: taskFolders, error } = await supabase
      .storage
      .from('content')
      .list(`content/training/${trainingSlug}`, { sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error('タスク一覧取得エラー:', error);
      throw new Error('タスク一覧の取得に失敗しました');
    }

    if (!taskFolders || taskFolders.length === 0) {
      return [];
    }

    const tasks = [];

    // 各タスクフォルダのcontent.mdファイルを読み込む
    for (const folder of taskFolders) {
      if (!folder.id.endsWith('/') || folder.name === 'meta.md') continue; // フォルダのみ、meta.mdは除外

      const taskSlug = folder.name;
      try {
        // タスクフォルダ内のcontent.mdファイルを確認
        const { data: files, error: filesError } = await supabase
          .storage
          .from('content')
          .list(`content/training/${trainingSlug}/${taskSlug}`);

        if (filesError || !files || !files.some(file => file.name === 'content.md')) {
          console.warn(`タスク ${taskSlug} のコンテンツファイルがありません`);
          continue;
        }

        const filePath = `content/training/${trainingSlug}/${taskSlug}/content.md`;
        const { data, error: contentError } = await supabase
          .storage
          .from('content')
          .download(filePath);

        if (contentError) {
          console.warn(`タスク ${taskSlug} のコンテンツ取得エラー:`, contentError);
          continue;
        }

        const content = await data.text();
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (!frontmatterMatch) {
          console.warn(`タスク ${taskSlug} のフロントマター形式が不正です`);
          continue;
        }

        const [_, frontmatterText] = frontmatterMatch;
        const frontmatter = parseFrontmatter(frontmatterText);

        tasks.push({
          slug: taskSlug,
          title: frontmatter.title || taskSlug,
          is_premium: frontmatter.is_premium || false,
          order_index: frontmatter.order_index || 999,
          video_full: frontmatter.video_full || null,
          video_preview: frontmatter.video_preview || null,
          preview_sec: frontmatter.preview_sec || 30
        });

      } catch (error) {
        console.warn(`タスク ${taskSlug} のメタデータ取得エラー:`, error);
        // エラーが発生しても続行
      }
    }

    // order_index でソート
    return tasks.sort((a, b) => a.order_index - b.order_index);
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    throw error;
  }
}

// トレーニングメタデータ取得ハンドラ
const handleGetTrainingMeta = async (req: Request): Promise<Response> => {
  try {
    // リクエストから情報を取得
    let trainingSlug, withTasks;
    
    // リクエスト方法によって異なる処理
    if (req.method === 'GET') {
      const url = new URL(req.url);
      trainingSlug = url.searchParams.get('slug') || undefined;
      withTasks = url.searchParams.get('tasks') === 'true';
    } else {
      // POSTリクエストの場合はbodyから取得
      try {
        const body = await req.json();
        trainingSlug = body.slug;
        withTasks = body.tasks === 'true';
      } catch (e) {
        console.error('リクエストボディの解析エラー:', e);
      }
    }
    
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // 認証情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    
    let result;
    
    try {
      // Storageからメタデータを取得
      result = await getTrainingMetaFromStorage(supabase, trainingSlug);
      
      // 特定のトレーニングが指定されていてかつタスク一覧も要求されている場合
      if (trainingSlug && withTasks) {
        const tasks = await getTrainingTaskList(supabase, trainingSlug);
        result = { ...result, tasks };
      }
    } catch (storageError) {
      console.log('ストレージからの取得に失敗、サンプルデータを使用:', storageError);
      
      // ストレージから取得できない場合はサンプルデータを使用
      if (trainingSlug) {
        result = {
          slug: trainingSlug,
          title: `${trainingSlug} トレーニング`,
          description: `${trainingSlug}の基本的な概念と実践的な使い方を学びます。`,
          type: "skill",
          difficulty: "初級",
          tags: ["React", "JavaScript", "フロントエンド"],
          thumbnailImage: 'https://source.unsplash.com/random/200x100'
        };
        
        if (withTasks) {
          result.tasks = [
            {
              slug: "introduction",
              title: "はじめに",
              is_premium: false,
              order_index: 1,
              video_full: "845235294",
              video_preview: "845235294",
              preview_sec: 30
            },
            {
              slug: "advanced",
              title: "応用編",
              is_premium: true,
              order_index: 2,
              video_full: "845235300",
              video_preview: "845235294",
              preview_sec: 30
            }
          ];
        }
      } else {
        result = [
          {
            slug: "react-basics",
            title: "React 基礎",
            description: "Reactの基本的な概念と実践的な使い方を学びます。",
            type: "skill",
            difficulty: "初級",
            tags: ["React", "JavaScript", "フロントエンド"],
            thumbnailImage: 'https://source.unsplash.com/random/200x100'
          }
        ];
      }
    }
    
    // レスポンスを返す
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('トレーニングメタデータ取得エラー:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'トレーニングメタデータの取得に失敗しました' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// リクエストハンドラ
serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // GET/POSTリクエストの処理
  if (req.method === 'GET' || req.method === 'POST') {
    return await handleGetTrainingMeta(req);
  }
  
  // その他のメソッドはエラー
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
});
