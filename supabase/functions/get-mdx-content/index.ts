
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
    preview_marker?: string;
    [key: string]: any;
  };
  error?: string;
  isFreePreview?: boolean;
}

// ストレージからMDXファイルを取得する関数
async function getMdxFileFromStorage(supabase, trainingSlug: string, taskSlug: string) {
  try {
    // 新しいパスの構築: content/training/trainingSlug/taskSlug/content.md
    const filePath = `content/training/${trainingSlug}/${taskSlug}/content.md`;
    
    // ファイルの存在確認
    const { data: existsData, error: existsError } = await supabase
      .storage
      .from('content')
      .list(`content/training/${trainingSlug}/${taskSlug}`);

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

// ユーザーのサブスクリプション確認関数
async function checkUserMemberSubscription(supabase, user) {
  if (!user) return false;
  
  try {
    // サブスクリプション情報を確認
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_members', true)
      .single();

    if (error) {
      console.error('サブスクリプション確認エラー:', error);
      return false;
    }

    // サブスクリプションが存在する場合、プレミアム権限あり
    return Boolean(data);
  } catch (error) {
    console.error('サブスクリプション確認中にエラー:', error);
    return false;
  }
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
    
    // ユーザー情報のログ
    console.log(`リクエストユーザー: ${user ? user.id : '未認証'}`);
    
    let mdxContent: MdxContentResponse;
    
    try {
      // ストレージからファイルを取得
      mdxContent = await getMdxFileFromStorage(supabaseAdmin, trainingSlug, taskSlug);
      console.log(`コンテンツ取得完了: ${trainingSlug}/${taskSlug}`);
    } catch (storageError) {
      console.error('ストレージからの取得に失敗、データベースからの取得を試みます:', storageError);
      
      // ストレージから取得できない場合はDBからの取得を試みる
      try {
        const { data: taskData, error: taskError } = await supabaseAdmin
          .from('task')
          .select('*, training:training_id(*)')
          .eq('slug', taskSlug)
          .single();
          
        if (taskError || !taskData) {
          throw new Error('タスクが見つかりません');
        }
        
        mdxContent = {
          content: taskData.content || `# ${taskSlug}\n\n${trainingSlug}のタスク内容です。`,
          frontmatter: {
            title: taskData.title || `${taskSlug} タスク`,
            order_index: taskData.order_index || 1,
            is_premium: taskData.is_premium || false,
            video_full: taskData.video_full,
            video_preview: taskData.video_preview,
            preview_sec: taskData.preview_sec || 30
          }
        };
      } catch (dbError) {
        console.error('データベースからの取得にも失敗、サンプルデータを使用します:', dbError);
        // DBからも取得できない場合はサンプルデータを使用
        mdxContent = {
          content: `# ${taskSlug} タスク\n\n${trainingSlug}の詳細を説明します。\n\nこのコンテンツはサンプルデータです。`,
          frontmatter: {
            title: `${taskSlug} タスク`,
            order_index: 1,
            is_premium: taskSlug.includes('premium'),
            preview_sec: 30
          }
        };
      }
    }
    
    // プレミアムコンテンツのアクセス制御
    const isPremium = mdxContent.frontmatter.is_premium;
    
    // プレミアムコンテンツで非認証ユーザーまたは非サブスクライバーの場合プレビュー表示
    let isFreePreview = false;
    
    if (isPremium) {
      // 会員ステータスの確認
      const hasMembership = await checkUserMemberSubscription(supabaseAdmin, user);
      
      // 非会員または未認証ユーザーはプレビューのみ表示
      if (!hasMembership) {
        console.log('非会員ユーザーまたは未認証ユーザー: プレビュー表示');
        isFreePreview = true;
        
        // フロントで処理を行うため、ここではコンテンツは変更せず、isFreePreviewフラグのみ設定
        // （フラグを見てフロントエンド側でマーカーによる分割を行う）
      }
    }
    
    return new Response(
      JSON.stringify({ 
        content: mdxContent.content,
        frontmatter: mdxContent.frontmatter,
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
        error: error.message || 'MDXコンテンツの取得に失敗しました',
        // 最低限のコンテンツを返してフロントエンドのクラッシュを防ぐ
        content: '# エラーが発生しました\n\nコンテンツの取得中にエラーが発生しました。',
        frontmatter: { title: 'エラー' },
        isFreePreview: false
      }),
      { 
        status: 200, // エラーでも200を返しフロントエンドでハンドリング
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
