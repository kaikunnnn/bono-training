// src/app/api/mail/resend-webhook/route.ts
// Resend の webhook の受け口（268 S1: 開いた・押した / 264 §5-11: 届かなかった・迷惑メール報告）。
//
// - 署名を検証する（Resend の webhook は Svix 形式。svix-id / svix-timestamp / svix-signature ヘッダー、
//   鍵は RESEND_WEBHOOK_SECRET（whsec_...）。検証は resend ライブラリの webhooks.verify で行い、古すぎる時刻も弾かれる）
// - 検証には生の本文が要るので、先に request.text() で読む
// - 本文には宛先アドレスが入っているので、ログに出さない・保存しない
// - DB の失敗は 500 を返して Resend に送り直させる（同じ svix-id は DB 側で2回処理しない）

import { NextRequest, NextResponse } from "next/server";
import { notifyMailOps } from "@/lib/member-mail/ops-alert";
import { getMailStore } from "@/lib/member-mail/runtime";
import { handleResendEvent } from "@/lib/member-mail/webhook";
import { verifyResendWebhook } from "@/lib/member-mail/webhook-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const store = getMailStore();
  if (!secret || !store) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const webhookId = request.headers.get("svix-id");
  const payload = verifyResendWebhook(
    rawBody,
    {
      id: webhookId,
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
    },
    secret,
  );
  if (!payload || !webhookId) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  try {
    const outcome = await handleResendEvent(
      { store, notifyOps: notifyMailOps, now: () => new Date() },
      webhookId,
      payload,
    );
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    console.error("[member-mail] webhook failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
