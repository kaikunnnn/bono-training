
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MOCK_CONTENTS } from "./mock-data.ts";
import { getUserPlanInfo, hasAccessToContent } from "./access-control.ts";

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

    let contentId: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        logDebug('リクエストボディ:', body);
        contentId = body.id;
      } catch (e) {
        console.error('リクエストボディ解析エラー:', e);
        return new Response(
          JSON.stringify({ 
            error: true, 
            message: 'リクエストボディの解析に失敗しました'
          }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
    }

    if (!contentId) {
      console.error('コンテンツID未指定');
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'コンテンツIDが指定されていません'
        }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
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

    if (userError) {
      console.error('ユーザー取得エラー:', userError);
      logDebug('認証エラー詳細:', userError);
      return new Response(
        JSON.stringify({ error: true, message: 'ユーザー情報の取得に失敗しました' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user) {
      logDebug('非ログインユーザーアクセス');
      // 非ログインユーザーも無料コンテンツにはアクセス可能
      const userPlan = { planType: null, isActive: false };
      
      // コンテンツデータを取得
      const content = MOCK_CONTENTS.find(c => c.id === contentId);
      
      if (!content) {
        return new Response(
          JSON.stringify({ error: true, message: 'コンテンツが見つかりませんでした' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // 無料コンテンツの場合のみアクセス許可
      if (content.accessLevel === 'free') {
        logDebug('非ログインユーザーに無料コンテンツを配信');
        return new Response(
          JSON.stringify({ content }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        logDebug('非ログインユーザーが有料コンテンツにアクセス試行');
        return new Response(
          JSON.stringify({ 
            error: false, 
            message: 'このコンテンツはログインが必要です',
            content: {
              ...content,
              // 有料コンテンツの場合、無料部分のみを返す
              videoUrl: content.freeVideoUrl || null,
              content: content.freeContent || null,
            },
            isFreePreview: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    logDebug('認証済みユーザーアクセス:', { userId: user.id, email: user.email });
    
    // ユーザーのプラン情報を取得
    const userPlan = await getUserPlanInfo(supabaseAdmin, user.id);
    logDebug('ユーザープラン情報:', userPlan);
    
    // コンテンツデータを取得
    const content = MOCK_CONTENTS.find(c => c.id === contentId);
    
    if (!content) {
      console.error('コンテンツが見つかりません:', contentId);
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'コンテンツが見つかりませんでした'
        }),
        { 
          status: 200, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // コンテンツへのアクセス権限をチェック
    const hasAccess = hasAccessToContent(userPlan, content.accessLevel);
    logDebug('コンテンツアクセス判定:', { 
      contentId, 
      contentAccessLevel: content.accessLevel, 
      userPlanType: userPlan.planType,
      isActive: userPlan.isActive,
      hasAccess 
    });
    
    if (!hasAccess) {
      logDebug('アクセス拒否: 無料プレビューコンテンツを返却');
      return new Response(
        JSON.stringify({ 
          error: false,
          message: 'このコンテンツにアクセスするには、サブスクリプションが必要です',
          content: {
            ...content,
            // 有料コンテンツの場合、無料部分のみを返す
            videoUrl: content.freeVideoUrl || null,
            content: content.freeContent || null,
          },
          isFreePreview: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // アクセス権限があれば、コンテンツ全体を返す
    logDebug('アクセス許可: フルコンテンツを返却');
    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('サーバーエラー:', error);
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'サーバー内部エラーが発生しました'
      }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
