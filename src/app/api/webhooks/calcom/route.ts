// src/app/api/webhooks/calcom/route.ts
// Cal.com の webhook の受け口（#327-F: 30分相談 https://cal.com/takumikai/30min を予約した人を、相談に誘うメールから外す）。
//
// - 署名を検証する（ヘッダー X-Cal-Signature-256 = 本文の HMAC-SHA256 の16進、鍵は CALCOM_WEBHOOK_SECRET）
//   出典: https://cal.com/help/webhooks / https://cal.com/docs/features/workflow-webhooks
//   （詳しくは src/lib/member-mail/calcom-webhook.ts の冒頭）
// - 鍵か記録先が無ければ 503 を返し、何もしない
// - 検証には生の本文が要るので、先に request.text() で読む
// - 本文には予約した人のアドレスが入っているので、ログに出さない（出すのは種類と結果だけ）
// - 30分相談の予約だけを記録する（slug は CALCOM_CONSULT_EVENT_SLUG、既定 30min。CALCOM_CONSULT_EVENT_TYPE_ID でも指定できる）
// - DB の失敗は 500 を返す（同じ予約は何度届いても1行。取り消しは戻さない）

import { NextRequest, NextResponse } from "next/server";
import {
  CALCOM_SIGNATURE_HEADER,
  consultEventFromEnv,
  handleCalcomEvent,
  verifyCalcomSignature,
  type CalcomWebhookBody,
} from "@/lib/member-mail/calcom-webhook";
import { getMailStore } from "@/lib/member-mail/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET ?? "";
  const store = secret ? getMailStore() : null;
  if (!secret || !store) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!verifyCalcomSignature(rawBody, request.headers.get(CALCOM_SIGNATURE_HEADER), secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let body: CalcomWebhookBody;
  try {
    body = JSON.parse(rawBody) as CalcomWebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  try {
    const outcome = await handleCalcomEvent({ store, matcher: consultEventFromEnv() }, body);
    const trigger = typeof body.triggerEvent === "string" ? body.triggerEvent.slice(0, 40) : "unknown";
    console.log("[member-mail] calcom webhook", { trigger, outcome });
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    console.error("[member-mail] calcom webhook failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
