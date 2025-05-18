
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MdxContentRequest {
  trainingSlug: string;
  taskSlug: string;
}

interface MdxContentResponse {
  content: string;
  frontmatter: {
    title: string;
    order_index?: number;
    is_premium?: boolean;
    video_full?: string;
    video_preview?: string;
    [key: string]: any;
  };
  error?: string;
  isFreePreview?: boolean;
}

// ストレージからMDXファイルを取得する関数
async function getMdxFileFromStorage(supabase, trainingSlug: string, taskSlug: string) {
  try {
    // パスの構築: public/trainingSlug/taskSlug/content.md
    const filePath = `public/${trainingSlug}/${taskSlug}/content.md`;

    // ファイルの存在確認
    const { data: existsData, error: existsError } = await supabase
      .storage
      .from('content')
      .list(`public/${trainingSlug}/${taskSlug}`);

    if (existsError) {
      console.error('ファイル存在確認エラー:', existsError);
      throw new Error('ファイルの確認に失敗しました');
    }

    if (!existsData || existsData.length === 0 || !existsData.some(file => file.name === 'content.md')) {
      console.error('ファイルが見つかりません:', filePath);
      throw new Error('指定されたコンテンツファイルが見つかりません');
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

    return { content: mdContent.trim(), frontmatter };
  } catch (error) {
    console.error('ストレージからのファイル取得エラー:', error);
    throw error;
  }
}

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

// MDXコンテンツ取得ハンドラ
const handleGetMdxContent = async (req: Request): Promise<Response> => {
  try {
    // リクエストボディからトレーニングとタスクのスラッグを取得
    const requestData = await req.json() as MdxContentRequest;
    const { trainingSlug, taskSlug } = requestData;
    
    if (!trainingSlug || !taskSlug) {
      return new Response(
        JSON.stringify({ 
          error: "トレーニングスラッグとタスクスラッグが必要です"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // 認証情報を取得
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    
    let mdxContent: MdxContentResponse;
    
    try {
      // ストレージからファイルを取得
      mdxContent = await getMdxFileFromStorage(supabaseAdmin, trainingSlug, taskSlug);
    } catch (storageError) {
      console.log('ストレージからの取得に失敗、サンプルデータを使用:', storageError);
      
      // ストレージから取得できない場合はサンプルデータを使用
      mdxContent = {
        content: `# ${taskSlug} タスク\n\n${trainingSlug}の詳細を説明します。\n\nこのコンテンツはサンプルデータです。`,
        frontmatter: {
          title: `${taskSlug} タスク`,
          order_index: 1,
          is_premium: taskSlug.includes('premium')
        }
      };
    }
    
    // プレミアムコンテンツのアクセス制御
    const isPremium = mdxContent.frontmatter.is_premium;
    
    // プレミアムコンテンツで非認証ユーザーまたは非サブスクライバーの場合プレビュー表示
    let isFreePreview = false;
    
    if (isPremium) {
      // ユーザーのサブスクリプション情報を取得
      if (!user) {
        // 未認証ユーザー：プレビューのみ表示
        isFreePreview = true;
      } else {
        // サブスクリプション情報を確認
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_members', true)
          .single();
        
        // サブスクリプションがない場合はプレビューのみ表示
        if (!subscription) {
          isFreePreview = true;
        }
      }
    }
    
    // プレビュー表示の場合はコンテンツを制限
    if (isFreePreview) {
      // コンテンツの最初の一部分のみを返す
      const previewLength = 500; // 500文字までをプレビューとする
      mdxContent.content = mdxContent.content.substring(0, previewLength) + '...';
    }
    
    return new Response(
      JSON.stringify({ 
        ...mdxContent,
        isFreePreview
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('MDXコンテンツ取得エラー:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'MDXコンテンツの取得に失敗しました' 
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
  
  // POSTリクエストの処理
  if (req.method === 'POST') {
    return await handleGetMdxContent(req);
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
