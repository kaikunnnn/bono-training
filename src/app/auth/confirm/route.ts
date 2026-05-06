import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * PKCE対応のメール確認エンドポイント
 * メールテンプレートから {{ .SiteURL }}/auth/confirm?token_hash=xxx&type=recovery 形式で呼ばれる
 * Supabaseの /auth/v1/verify を経由せず、アプリ側で直接トークンを検証する
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

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
    console.error("[auth/confirm] OTP verification failed:", error.message);
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
