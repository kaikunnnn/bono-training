/**
 * Cal.com の webhook（30分相談の予約・取り消し・日時の変更）の署名検証と処理（#327-F）。
 * 受け口は src/app/api/webhooks/calcom/route.ts。記録は member_mail_consult_bookings
 * （supabase/migrations/20261127084404_member_mail_consult_bookings.sql）。
 *
 * 出典（Cal.com 公式。2026-11-27 に確認）:
 * - https://cal.com/help/webhooks
 *   - 「Verifying the authenticity of the received payload」: webhook の secret で HMAC（SHA256）を作り、
 *     受け取った本文で更新して、ヘッダー X-Cal-Signature-256 の値と比べる
 *   - 例の本文: { triggerEvent, createdAt, payload: { type, uid, startTime, attendees[{ email }], eventTypeId, ... } }
 *     payload.type は「The event type slug」（項目の表）
 *   - BOOKING_RESCHEDULED: payload.uid は新しい予約の uid、payload.rescheduleUid が元の予約の uid
 *   - BOOKING_CANCELLED: payload.status = "CANCELLED"（uid は取り消した予約）
 *   - 署名は本文の生のバイト列に対して計算される（独自ヘッダーがあっても同じ）
 *   - このページは値の書き方（16進か base64 か）を書いていない
 * - https://cal.com/docs/features/workflow-webhooks
 *   - 「Send webhook」の手順（workflow）のページ。X-Cal-Signature-256 は「An HMAC-SHA256 hex digest of the request body」、
 *     secret が無いと値は `no-secret-provided`、とある
 *   ★16進であることと `no-secret-provided` は、このページ（workflow の webhook）の記述で、
 *     ふつうの webhook（Settings → Developer → Webhooks）でも同じかは公式に書かれていない。
 *     本番で webhook を作ったあとの試しの予約で確かめる（合わなければ 401 になり、運用 Slack に calcom_invalid_signature が出る）
 *
 * 守ること:
 * - アドレスはログに出さない（出すのは種類と結果だけ）。保存するのは DB の表の中だけ
 * - 同じ予約（uid）は何度届いても1行。取り消しは戻さない（DB 関数で守る）
 * - 30分相談の予約だけを記録する（event type の slug。既定は 30min。環境変数で変えられる）
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { ConsultBookingStore } from "./types";

export const CALCOM_SIGNATURE_HEADER = "x-cal-signature-256";
/** 30分相談の予約ページ https://cal.com/takumikai/30min の slug */
export const DEFAULT_CONSULT_EVENT_SLUG = "30min";

/** 正しい署名か（HMAC-SHA256 の16進。長さが違えば比べずに false。比べるときは時間が一定の比較） */
export function verifyCalcomSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!secret || !signature) return false;
  const received = signature.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(received)) return false; // no-secret-provided などもここで弾く
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(received, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface CalcomWebhookBody {
  triggerEvent?: unknown;
  createdAt?: unknown;
  payload?: {
    type?: unknown;
    eventTypeId?: unknown;
    uid?: unknown;
    rescheduleUid?: unknown;
    startTime?: unknown;
    attendees?: unknown;
  } | null;
}

export interface ConsultEventMatcher {
  slug: string;
  /** 指定すると、payload.eventTypeId がこの値の予約も 30分相談として扱う */
  eventTypeId: number | null;
}

/** 環境変数から 30分相談の event type を決める（CALCOM_CONSULT_EVENT_SLUG / CALCOM_CONSULT_EVENT_TYPE_ID） */
export function consultEventFromEnv(env: Record<string, string | undefined> = process.env): ConsultEventMatcher {
  const slug = (env.CALCOM_CONSULT_EVENT_SLUG ?? "").trim() || DEFAULT_CONSULT_EVENT_SLUG;
  const id = Number((env.CALCOM_CONSULT_EVENT_TYPE_ID ?? "").trim());
  return { slug, eventTypeId: Number.isInteger(id) && id > 0 ? id : null };
}

export function isConsultEvent(payload: CalcomWebhookBody["payload"], matcher: ConsultEventMatcher): boolean {
  if (!payload) return false;
  if (typeof payload.type === "string" && payload.type === matcher.slug) return true;
  return matcher.eventTypeId !== null && Number(payload.eventTypeId) === matcher.eventTypeId;
}

function bookingUid(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 200 ? value : null;
}

/** 予約した本人のアドレス（attendees[0]。主催者は見ない）。小文字にして返す */
export function attendeeEmail(payload: CalcomWebhookBody["payload"]): string | null {
  const list = payload?.attendees;
  if (!Array.isArray(list) || list.length === 0) return null;
  const email = (list[0] as { email?: unknown } | null)?.email;
  if (typeof email !== "string") return null;
  const lower = email.trim().toLowerCase();
  return lower.includes("@") && lower.length <= 320 ? lower : null;
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type CalcomOutcome = "booked" | "cancelled" | "rescheduled" | "ignored" | "other_event_type" | "invalid";

/**
 * 1件の webhook を処理する（署名の検証は済んでいる前提）。
 * - BOOKING_CREATED → 予約を booked で記録
 * - BOOKING_CANCELLED → 予約を cancelled で記録（記録が無い予約でも cancelled の行を作る。あとで CREATED が届いても戻らない）
 * - BOOKING_RESCHEDULED → 新しい uid を booked、元の予約（rescheduleUid）を cancelled で記録
 * - それ以外（PING などの確認・ほかの種類）→ 何もしない
 */
export async function handleCalcomEvent(
  deps: { store: ConsultBookingStore; matcher: ConsultEventMatcher },
  body: CalcomWebhookBody,
): Promise<CalcomOutcome> {
  const trigger = typeof body.triggerEvent === "string" ? body.triggerEvent : "";
  if (!["BOOKING_CREATED", "BOOKING_CANCELLED", "BOOKING_RESCHEDULED"].includes(trigger)) return "ignored";
  const payload = body.payload ?? null;
  if (!isConsultEvent(payload, deps.matcher)) return "other_event_type";
  const uid = bookingUid(payload?.uid);
  const email = attendeeEmail(payload);
  if (!uid || !email) return "invalid";
  const startTime = toDate(payload?.startTime);

  if (trigger === "BOOKING_CANCELLED") {
    await deps.store.recordConsultBooking({ bookingUid: uid, attendeeEmail: email, status: "cancelled", startTime });
    return "cancelled";
  }
  await deps.store.recordConsultBooking({ bookingUid: uid, attendeeEmail: email, status: "booked", startTime });
  if (trigger === "BOOKING_RESCHEDULED") {
    const previous = bookingUid(payload?.rescheduleUid);
    if (previous && previous !== uid) {
      await deps.store.recordConsultBooking({ bookingUid: previous, attendeeEmail: email, status: "cancelled", startTime: null });
    }
    return "rescheduled";
  }
  return "booked";
}
