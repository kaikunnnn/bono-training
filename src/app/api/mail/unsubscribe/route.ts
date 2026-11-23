// src/app/api/mail/unsubscribe/route.ts
// ワンクリック配信停止の受け口（RFC 8058 / 264 §5-8）。メールの List-Unsubscribe ヘッダーの宛先。
//
// - Gmail などの「配信停止」ボタンから、画面なし・ログイン情報なしで POST が届く
//   （本文は List-Unsubscribe=One-Click）。URL の t= の署名つきトークンで「誰の・どのカテゴリか」を確かめて、すぐ止める
// - GET では止めない（GET はエクスポートしない → 405。リンクを自動で開くセキュリティソフト対策）
// - 本文のリンクから開く人向けの画面は /mail/unsubscribe（押したときだけ止める）
// - 返す内容に個人情報は入れない

import { NextRequest, NextResponse } from "next/server";
import { getMailStore, getUnsubscribeSecret } from "@/lib/member-mail/runtime";
import { unsubscribeByToken } from "@/lib/member-mail/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  const secret = getUnsubscribeSecret();
  const store = getMailStore();
  if (!secret || !store) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  try {
    const outcome = await unsubscribeByToken(store, secret, token, "one_click", new Date());
    if (outcome === "invalid_token") {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[member-mail] one-click unsubscribe failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
