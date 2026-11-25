import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { reportAuthError } from "@/lib/monitoring";
import { sanitizeRedirect } from "@/lib/safe-redirect";

/**
 * PKCE対応のメール確認エンドポイント
 * メールテンプレートから {{ .SiteURL }}/auth/confirm?token_hash=xxx&type=recovery 形式で呼ばれる
 * Supabaseの /auth/v1/verify を経由せず、アプリ側で直接トークンを検証する
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // next は URL から誰でも入れられるので内部パスだけ通す（外のサイトへ飛ばせないように）
  const next = sanitizeRedirect(searchParams.get("next"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", request.url)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    await reportAuthError({
      type: "otp_verification_failed",
      message: error.message,
      path: "/auth/confirm",
    });
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url)
    );
  }

  // 検証成功：タイプに応じてリダイレクト
  if (type === "recovery") {
    return NextResponse.redirect(
      new URL("/auth/update-password", request.url)
    );
  }

  // signup / email 等はホームへ
  return NextResponse.redirect(new URL(next, request.url));
}
