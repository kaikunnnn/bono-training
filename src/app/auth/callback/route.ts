import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { reportAuthError } from "@/lib/monitoring";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // code はあったが交換失敗 → システムバグの可能性があるため通知
    await reportAuthError({
      type: "callback_failed",
      message: `Code exchange failed: ${error.message}`,
      path: "/auth/callback",
    });
  }
  // code がない = リンク期限切れ or スキャナ消費 → ユーザー起因なので通知しない

  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
