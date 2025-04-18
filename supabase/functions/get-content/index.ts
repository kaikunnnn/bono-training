
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS ヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// モックコンテンツデータ（本番環境では CMS から取得）
const MOCK_CONTENTS = [
  {
    id: "1",
    title: "Figmaの基本操作マスター",
    description: "Figmaの基本的な使い方から応用テクニックまでを解説",
    type: "video",
    categories: ["figma", "ui-design"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "free",
    videoUrl: "https://player.vimeo.com/video/76979871",
    freeVideoUrl: "https://player.vimeo.com/video/76979871",
    videoDuration: 1800,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    published: true,
  },
  {
    id: "2",
    title: "UIデザイントレンド2025",
    description: "2025年のUIデザイントレンドと実装方法",
    type: "article",
    categories: ["ui-design"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "standard",
    content: "2025年のUIデザイントレンドとしては、ニューモーフィズムの進化版やマイクロインタラクションの高度な活用、AI支援のパーソナライズドUIなどが注目されています。\n\nこの記事では、これらのトレンドについて詳しく解説し、実際の実装方法やユーザーエクスペリエンスへの影響について考察します。",
    freeContent: "2025年のUIデザイントレンドとしては、ニューモーフィズムの進化版やマイクロインタラクションの高度な活用などが注目されています。",
    createdAt: "2025-02-20T14:30:00Z",
    updatedAt: "2025-02-25T09:15:00Z",
    published: true,
  },
  {
    id: "3",
    title: "UXリサーチの手法と実践",
    description: "効果的なUXリサーチの方法とその活用法",
    type: "tutorial",
    categories: ["ux-design", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "standard",
    content: "UXリサーチは製品開発において非常に重要なプロセスです。ユーザーインタビュー、ユーザビリティテスト、A/Bテスト、アイトラッキングなど様々な手法があります。\n\nこのチュートリアルでは、これらの手法を実際のプロジェクトでどのように活用すればよいか、また得られたデータをどのように分析し、デザインに反映させるかについて解説します。",
    freeContent: "UXリサーチは製品開発において非常に重要なプロセスです。ユーザーインタビュー、ユーザビリティテスト、A/Bテストなど様々な手法があります。",
    createdAt: "2025-03-05T11:45:00Z",
    updatedAt: "2025-03-10T16:20:00Z",
    published: true,
  },
  {
    id: "4",
    title: "デザインシステムの構築と運用",
    description: "効率的なデザインシステムの作り方と組織での活用方法",
    type: "course",
    categories: ["ui-design", "ux-design", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "growth",
    lessonIds: ["4-1", "4-2", "4-3", "4-4"],
    createdAt: "2025-01-30T08:20:00Z",
    updatedAt: "2025-04-01T13:10:00Z",
    published: true,
  },
  {
    id: "5",
    title: "コミュニティ限定ワークショップ",
    description: "メンバー限定のインタラクティブワークショップ",
    type: "video",
    categories: ["member", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "community",
    videoUrl: "https://player.vimeo.com/video/783455051",
    freeVideoUrl: "https://player.vimeo.com/video/783455051?h=afd34abcd1",
    videoDuration: 5400,
    createdAt: "2025-04-10T15:00:00Z",
    updatedAt: "2025-04-10T15:00:00Z",
    published: true,
  }
];

// プラン制御のマッピング
const CONTENT_PERMISSIONS = {
  learning: ['standard', 'growth', 'community'],
  member: ['growth', 'community'],
  free: ['free', 'standard', 'growth', 'community'], // 無料コンテンツは全てのプランで閲覧可能
};

// アクセスレベルとコンテンツタイプのマッピング
const ACCESS_LEVEL_MAPPING = {
  'free': 'free',
  'standard': 'learning',
  'growth': 'learning',
  'community': 'member',
};

// ユーザープラン情報の取得（本番環境では DB から取得）
async function getUserPlanInfo(supabase, userId) {
  try {
    // user_subscriptions テーブルからユーザーのサブスクリプション情報を取得
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

// コンテンツへのアクセス権限があるかチェック
function hasAccessToContent(userPlan, contentAccessLevel) {
  // サブスクリプションがアクティブでない場合、無料コンテンツのみアクセス可能
  if (!userPlan.isActive || !userPlan.planType) {
    return contentAccessLevel === 'free';
  }

  // アクセスレベルをコンテンツタイプに変換
  const contentType = ACCESS_LEVEL_MAPPING[contentAccessLevel] || 'free';
  
  // コンテンツタイプに対応するプラン一覧を取得
  const allowedPlans = CONTENT_PERMISSIONS[contentType] || [];
  
  // ユーザーのプランがアクセス可能かチェック
  return allowedPlans.includes(userPlan.planType);
}

// メインハンドラー
serve(async (req) => {
  // CORS プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let contentId;
    
    // リクエストメソッドに基づいてcontentIdを取得する
    if (req.method === 'GET') {
      // URLからクエリパラメータを取得する試み
      const url = new URL(req.url);
      contentId = url.searchParams.get('id');
      
      // クエリパラメータが存在しない場合、リクエストボディからIDを取得
      if (!contentId) {
        try {
          const requestData = await req.json();
          contentId = requestData.id;
        } catch (e) {
          console.error('リクエストボディの解析エラー:', e);
        }
      }
    } else {
      // その他のメソッドの場合はリクエストボディから取得
      try {
        const requestData = await req.json();
        contentId = requestData.id;
      } catch (e) {
        console.error('リクエストボディの解析エラー:', e);
      }
    }

    if (!contentId) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'コンテンツIDが指定されていません' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'ユーザー情報の取得に失敗しました' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      // 非ログインユーザーも無料コンテンツにはアクセス可能
      const userPlan = { planType: null, isActive: false };
      
      // コンテンツデータを取得
      const content = MOCK_CONTENTS.find(c => c.id === contentId);
      
      if (!content) {
        return new Response(
          JSON.stringify({ error: 'Not Found', message: 'コンテンツが見つかりませんでした' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // 無料コンテンツの場合のみアクセス許可
      if (content.accessLevel === 'free') {
        return new Response(
          JSON.stringify({ content }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Forbidden', message: 'このコンテンツはログインが必要です' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ユーザーのプラン情報を取得
    const userPlan = await getUserPlanInfo(supabaseAdmin, user.id);
    
    // コンテンツデータを取得
    const content = MOCK_CONTENTS.find(c => c.id === contentId);
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Not Found', message: 'コンテンツが見つかりませんでした' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // コンテンツへのアクセス権限をチェック
    const hasAccess = hasAccessToContent(userPlan, content.accessLevel);
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'このコンテンツにアクセスするには、サブスクリプションが必要です',
          content: {
            ...content,
            // 有料コンテンツの場合、無料部分のみを返す
            videoUrl: content.freeVideoUrl || null,
            content: content.freeContent || null,
            isFreePreview: true,
          }
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // アクセス権限があれば、コンテンツ全体を返す
    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('コンテンツ取得エラー:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: 'サーバー内部エラーが発生しました' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
