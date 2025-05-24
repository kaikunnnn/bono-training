
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

// ユーザーのサブスクリプション確認関数
async function checkUserMemberSubscription(supabase, user) {
  if (!user) return false;
  
  try {
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

    return Boolean(data);
  } catch (error) {
    console.error('サブスクリプション確認中にエラー:', error);
    return false;
  }
}

// プレミアムコンテンツをフィルタリングする関数
function filterPremiumContent(content: string, previewMarker: string = '<!-- PREMIUM_ONLY -->') {
  const contentParts = content.split(previewMarker);
  
  if (contentParts.length <= 1) {
    return { freeContent: content, hasPreviewMarker: false };
  }
  
  return { 
    freeContent: contentParts[0].trim(), 
    hasPreviewMarker: true 
  };
}

async function getTaskContent(supabase, trainingSlug: string, taskSlug: string, user: any) {
  try {
    const taskPath = `content/training/${trainingSlug}/tasks/${taskSlug}/content.md`;
    
    // ファイル存在確認
    const { data: files, error: listError } = await supabase
      .storage
      .from('content')
      .list(`content/training/${trainingSlug}/tasks/${taskSlug}`);

    if (listError || !files || !files.some(file => file.name === 'content.md')) {
      throw new Error(`タスク「${taskSlug}」のコンテンツが見つかりません`);
    }

    // ファイル内容取得
    const { data, error } = await supabase
      .storage
      .from('content')
      .download(taskPath);

    if (error) {
      console.error('ファイル取得エラー:', error);
      throw new Error('ファイルの取得に失敗しました');
    }

    const content = await data.text();
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error('正しいフロントマター形式ではありません');
    }

    const [_, frontmatterText, mdContent] = frontmatterMatch;
    const frontmatter = parseFrontmatter(frontmatterText);

    // プレミアムコンテンツのアクセス制御
    const isPremium = frontmatter.is_premium === true;
    let isFreePreview = false;
    let contentToReturn = mdContent.trim();
    
    if (isPremium) {
      const hasMembership = await checkUserMemberSubscription(supabase, user);
      
      if (!hasMembership) {
        console.log('非会員ユーザー: プレミアムコンテンツを制限します');
        isFreePreview = true;
        
        const previewMarker = frontmatter.preview_marker || '<!-- PREMIUM_ONLY -->';
        const { freeContent, hasPreviewMarker } = filterPremiumContent(mdContent, previewMarker);
        
        if (hasPreviewMarker) {
          contentToReturn = freeContent;
          console.log('プレミアムマーカーが見つかりました。コンテンツを制限します。');
        }
      } else {
        console.log('メンバーシップ会員: 全コンテンツを表示');
      }
    }

    return {
      content: contentToReturn,
      frontmatter: {
        title: frontmatter.title || taskSlug,
        slug: taskSlug,
        is_premium: frontmatter.is_premium || false,
        order_index: frontmatter.order_index || 1,
        difficulty: frontmatter.difficulty || 'normal',
        estimated_time: frontmatter.estimated_time || '',
        tags: frontmatter.tags || [],
        video_full: frontmatter.video_full || null,
        video_preview: frontmatter.video_preview || null,
        preview_sec: frontmatter.preview_sec || 30,
        preview_marker: frontmatter.preview_marker || '<!-- PREMIUM_ONLY -->'
      },
      isFreePreview
    };

  } catch (error) {
    console.error('タスクコンテンツ取得エラー:', error);
    throw error;
  }
}

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const requestData = await req.json();
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
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // 認証情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`リクエストユーザー: ${user ? user.id : '未認証'}`);
    
    const taskContent = await getTaskContent(supabase, trainingSlug, taskSlug, user);
    
    return new Response(
      JSON.stringify(taskContent),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('タスクコンテンツ取得エラー:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'タスクコンテンツの取得に失敗しました',
        // 最低限のコンテンツを返してフロントエンドのクラッシュを防ぐ
        content: '# エラーが発生しました\n\nコンテンツの取得中にエラーが発生しました。',
        frontmatter: { title: 'エラー', slug: 'error' },
        isFreePreview: false
      }),
      { 
        status: 200, // エラーでも200を返しフロントエンドでハンドリング
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
