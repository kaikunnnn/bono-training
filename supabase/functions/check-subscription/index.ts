
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, logDebug } from "./utils.ts";
import { createUnauthenticatedResponse, handleAuthenticatedRequest } from "./handlers.ts";

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    logDebug("OPTIONS リクエスト受信");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug("=== Edge Function 開始 ===");
    logDebug("リクエストメソッド", { method: req.method });

    // 認証ヘッダーから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    logDebug("認証ヘッダー確認", { hasAuthHeader: !!authHeader });

    if (!authHeader) {
      logDebug("認証ヘッダーなし、未認証レスポンスを返却");
      return createUnauthenticatedResponse();
    }

    logDebug("handleAuthenticatedRequest 呼び出し開始");
    const response = await handleAuthenticatedRequest(authHeader);
    logDebug("handleAuthenticatedRequest 正常終了");
    return response;
  } catch (error) {
    console.error("=== サーバーエラー発生 ===", error);
    logDebug("予期せぬエラー（catchブロック）", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });

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
