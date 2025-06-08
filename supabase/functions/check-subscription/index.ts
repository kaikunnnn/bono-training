
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, logDebug } from "./utils.ts";
import { createUnauthenticatedResponse, handleAuthenticatedRequest } from "./handlers.ts";

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug("関数開始");
    
    // 認証ヘッダーから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createUnauthenticatedResponse();
    }
    
    return await handleAuthenticatedRequest(authHeader);
  } catch (error) {
    console.error("サーバーエラー:", error);
    logDebug("予期せぬエラー", { error });
    
    return new Response(
      JSON.stringify({ 
        error: true,
        message: "サーバー内部エラーが発生しました",
        subscribed: false,
        planType: null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // エラー時も200を返してクライアントで処理
      }
    );
  }
});
