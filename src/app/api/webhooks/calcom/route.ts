// src/app/api/webhooks/calcom/route.ts
// Cal.com の webhook の受け口（#327-F: 30分相談 https://cal.com/takumikai/30min を予約した人を、相談に誘うメールから外す）。
//
// - 署名を検証する（ヘッダー X-Cal-Signature-256 = 本文の HMAC-SHA256、鍵は CALCOM_WEBHOOK_SECRET）
//   出典と、まだ確かめていない点は src/lib/member-mail/calcom-webhook.ts の冒頭
// - 鍵か記録先が無ければ 503 を返し、何もしない
// - 検証には生の本文が要るので、先に request.text() で読む
// - 本文には予約した人のアドレスが入っているので、ログ・通知に出さない（出すのは種類と件数だけ）
// - 30分相談の予約だけを記録する（slug は CALCOM_CONSULT_EVENT_SLUG、既定 30min。CALCOM_CONSULT_EVENT_TYPE_ID でも指定できる）
// - DB の失敗は 500 を返す（同じ予約は何度届いても1行。取り消しは戻さない）
// - 署名が合わない（401）・記録の失敗（500）・中身が読めない（invalid）は運用 Slack に件数だけ出す
//   （予約が記録されないと、予約した人にも相談の誘いが届くため、黙って落とさない）

import { NextRequest, NextResponse } from "next/server";
import {
  CALCOM_SIGNATURE_HEADER,
  consultEventFromEnv,
  handleCalcomEvent,
  verifyCalcomSignature,
  type CalcomWebhookBody,
} from "@/lib/member-mail/calcom-webhook";
import { notifyMailOps, type MailOpsAlert } from "@/lib/member-mail/ops-alert";
import { getMailStore } from "@/lib/member-mail/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KNOWN_TRIGGERS = new Set(["BOOKING_CREATED", "BOOKING_CANCELLED", "BOOKING_RESCHEDULED"]);

/** 通知の失敗で応答を変えない */
async function alert(a: MailOpsAlert) {
  try {
    await notifyMailOps(a);
  } catch {
    console.error("[member-mail] calcom alert failed");
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET ?? "";
  const store = secret ? getMailStore() : null;
  if (!secret || !store) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get(CALCOM_SIGNATURE_HEADER);
  if (!verifyCalcomSignature(rawBody, signature, secret)) {
    // URL は公開なので、署名の無い・形の違う POST では通知しない（ログだけ）。
    // 64桁の16進の署名が付いているのに合わない＝Cal.com からの可能性が高い（鍵の食い違い）ときだけ通知する
    if (!/^[0-9a-f]{64}$/i.test((signature ?? "").trim())) {
      console.warn("[member-mail] calcom webhook rejected", { reason: signature ? "malformed_signature" : "no_signature" });
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
    await alert({
      title: "Cal.com の webhook の署名が合いませんでした（30分相談の予約が記録されていない可能性があります）",
      counts: { calcom_invalid_signature: 1 },
      note: "Cal.com の webhook の Secret と Vercel の CALCOM_WEBHOOK_SECRET が同じか確かめてください。",
    });
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let body: CalcomWebhookBody;
  try {
    body = JSON.parse(rawBody) as CalcomWebhookBody;
  } catch {
    body = null as unknown as CalcomWebhookBody;
  }
  if (!body || typeof body !== "object") {
    await alert({ title: "Cal.com の webhook の本文が読めませんでした", counts: { calcom_invalid_body: 1 } });
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  // 種類は決まった名前だけを出す（知らない値をそのまま通知・ログに出さない）
  const trigger = typeof body.triggerEvent === "string" && KNOWN_TRIGGERS.has(body.triggerEvent) ? body.triggerEvent : "other";

  try {
    const outcome = await handleCalcomEvent({ store, matcher: consultEventFromEnv() }, body);
    console.log("[member-mail] calcom webhook", { trigger, outcome });
    if (outcome === "invalid") {
      await alert({
        title: "Cal.com の webhook の中身から予約を読めませんでした（記録していません）",
        counts: { [`calcom_invalid_${trigger.toLowerCase()}`]: 1 },
        note: "uid か予約した人のアドレスがありません。Cal.com の webhook で独自の payload テンプレートを使っていないか確かめてください。",
      });
    }
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    console.error("[member-mail] calcom webhook failed:", error instanceof Error ? error.message : "unknown");
    await alert({
      title: "Cal.com の予約を記録できませんでした（500 を返しました）",
      counts: { [`calcom_failed_${trigger.toLowerCase()}`]: 1 },
      note: "member_mail_consult_bookings のマイグレーションが当たっているか確かめてください。",
    });
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
