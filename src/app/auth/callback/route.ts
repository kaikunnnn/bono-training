import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { reportAuthError } from "@/lib/monitoring";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * S3-B: 認証確定後、既存Stripe契約を link-stripe-subscription Edge Function で
 * 自動リンクする（旧サイト契約者の新メール/新規登録対策）。
 * best-effort: Stripe API 呼び出しの失敗がサインアップ/ログイン体験を壊さないよう、
 * 例外は握りつぶしてログのみに留める。
 */
async function linkExistingStripeSubscriptionBestEffort(
  supabase: SupabaseClient
): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return;

    await fetch(`${supabaseUrl}/functions/v1/link-stripe-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    });
  } catch (err) {
    // best-effort: ログのみ
    console.error("[auth/callback] link-stripe-subscription 呼び出し失敗:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // S3-B: 認証確定時点で既存Stripe契約を自動リンク（旧サイト契約者の
      // 新メール/新規登録対策）。best-effort — 失敗してもリダイレクトは止めない。
      await linkExistingStripeSubscriptionBestEffort(supabase);
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
