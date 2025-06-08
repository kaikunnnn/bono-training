
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
 * ユーザーのプラン情報を取得
 */
async function getUserPlanInfo(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan_type, is_active')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('サブスクリプション情報取得エラー:', error);
      return { planType: null, isActive: false };
    }

    if (!data) {
      console.log('該当ユーザーのサブスクリプションデータなし:', { userId });
      return { planType: null, isActive: false };
    }

    return {
      planType: data.plan_type,
      isActive: data.is_active,
    };
  } catch (err) {
    console.error('ユーザープラン情報取得エラー:', err);
    return { planType: null, isActive: false };
  }
}

/**
 * メンバーアクセス権限をチェック
 */
function hasMemberAccess(userPlan: { planType: string | null, isActive: boolean }) {
  if (!userPlan.isActive || !userPlan.planType) {
    return false;
  }
  
  const memberAccessPlans = ['standard', 'growth', 'community'];
  return memberAccessPlans.includes(userPlan.planType);
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
  
  // 簡易YAML解析（必要最小限）
  const frontmatter: any = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
  });
  
  return { frontmatter, content: mainContent };
}

/**
 * プレミアムコンテンツを分割
 */
function splitPremiumContent(content: string, isPremium: boolean, hasAccess: boolean) {
  if (!isPremium || hasAccess) {
    return { content, isPremiumCut: false };
  }
  
  const premiumMarker = '<!-- PREMIUM_ONLY -->';
  const markerIndex = content.indexOf(premiumMarker);
  
  if (markerIndex === -1) {
    return { content, isPremiumCut: false };
  }
  
  const freeContent = content.substring(0, markerIndex).trim();
  return { content: freeContent, isPremiumCut: true };
}

// メインハンドラー
serve(async (req) => {
  // CORS プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug('リクエスト受信:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    let trainingSlug: string | null = null;
    let taskSlug: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        logDebug('リクエストボディ:', body);
        trainingSlug = body.trainingSlug;
        taskSlug = body.taskSlug;
      } catch (e) {
        console.error('リクエストボディ解析エラー:', e);
        return createErrorResponse('INVALID_REQUEST', 'リクエストボディの解析に失敗しました', 400);
      }
    }

    if (!trainingSlug || !taskSlug) {
      return createErrorResponse('INVALID_REQUEST', 'trainingSlugとtaskSlugが必要です', 400);
    }

    // Supabase クライアントを初期化
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // ユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser();

    let userPlan = { planType: null, isActive: false };
    
    if (user && !userError) {
      logDebug('認証済みユーザーアクセス:', { userId: user.id, email: user.email });
      userPlan = await getUserPlanInfo(supabaseAdmin, user.id);
      logDebug('ユーザープラン情報:', userPlan);
    } else {
      logDebug('非ログインユーザーまたは認証エラー');
    }
    
    // ファイルパスを構築
    const filePath = `${trainingSlug}/tasks/${taskSlug}/content.md`;
    logDebug('取得するファイルパス:', filePath);
    
    // ファイルコンテンツを取得
    const rawContent = await getFileContent(supabaseAdmin, filePath);
    
    if (!rawContent) {
      console.error('コンテンツが見つかりません:', filePath);
      return createErrorResponse('NOT_FOUND', 'コンテンツが見つかりませんでした', 404);
    }
    
    // フロントマターを解析
    const { frontmatter, content } = parseFrontmatter(rawContent);
    const isPremium = frontmatter.is_premium === true;
    
    logDebug('フロントマター解析結果:', { isPremium, title: frontmatter.title });
    
    // プレミアムアクセス権限をチェック
    const hasAccess = !isPremium || hasMemberAccess(userPlan);
    logDebug('アクセス権限チェック:', { isPremium, hasAccess, userPlan });
    
    // プレミアムコンテンツの分割処理
    const { content: displayContent, isPremiumCut } = splitPremiumContent(content, isPremium, hasAccess);
    
    // レスポンスデータを構築
    const responseData = {
      id: `${trainingSlug}-${taskSlug}`,
      slug: taskSlug,
      title: frontmatter.title || taskSlug,
      content: displayContent,
      is_premium: isPremium,
      order_index: frontmatter.order_index || 1,
      training_id: `${trainingSlug}-1`,
      created_at: null,
      video_full: frontmatter.video_full || null,
      video_preview: frontmatter.video_preview || null,
      preview_sec: frontmatter.preview_sec || 30,
      trainingTitle: frontmatter.training_title || trainingSlug,
      trainingSlug: trainingSlug,
      next_task: frontmatter.next_task || null,
      prev_task: frontmatter.prev_task || null,
      isPremiumCut,
      hasAccess
    };
    
    logDebug('レスポンスデータ:', responseData);
    
    return createSuccessResponse(responseData);
    
  } catch (error) {
    console.error('サーバーエラー:', error);
    return createErrorResponse('INTERNAL_ERROR', 'サーバー内部エラーが発生しました', 500);
  }
});
