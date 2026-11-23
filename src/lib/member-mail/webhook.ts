/**
 * Resend の webhook（#268 S1: 開いた・押した、#264 §5-11: 届かなかった・迷惑メール報告）の処理。
 * 署名の検証は route（src/app/api/mail/resend-webhook/route.ts）で済ませてから呼ぶ。
 *
 * - 本文（宛先アドレスを含む）は保存しない・ログに出さない。email_id と種類と時刻だけを使う
 * - 同じ webhook（svix-id）は2回処理しない（DB 関数の一意制約）
 * - 届かなかった・迷惑メール報告 → 以後どの種類も送らない（member_mail_suppressions）
 * - 迷惑メール報告が1件でも来たら、全体のスイッチを止める（264 §5-11「1件でも止まって考える」）
 */
import type { NotifyMailOps } from "./ops-alert";
import type { WebhookApplyResult, WebhookStore } from "./types";

export const TRACKED_EVENTS = new Set([
  "email.delivered",
  "email.opened",
  "email.clicked",
  "email.bounced",
  "email.complained",
]);

export interface ResendEventPayload {
  type?: unknown;
  created_at?: unknown;
  data?: {
    email_id?: unknown;
    created_at?: unknown;
    click?: { link?: unknown; timestamp?: unknown } | null;
  } | null;
}

/** 押されたリンクのパス。クエリは from= だけ残す（他の値に個人を表すものが入りうるため） */
export function sanitizeLinkPath(link: unknown): string | null {
  if (typeof link !== "string") return null;
  try {
    const url = new URL(link);
    const from = url.searchParams.get("from");
    const path = `${url.hostname}${url.pathname}`.slice(0, 300);
    return from && /^email_[a-z]+$/.test(from) ? `${path}?from=${from}` : path;
  } catch {
    return null;
  }
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type WebhookOutcome = WebhookApplyResult | "ignored" | "invalid";

export async function handleResendEvent(
  deps: { store: WebhookStore; notifyOps: NotifyMailOps; now: () => Date },
  webhookId: string,
  payload: ResendEventPayload,
): Promise<WebhookOutcome> {
  const type = typeof payload.type === "string" ? payload.type : "";
  if (!TRACKED_EVENTS.has(type)) return "ignored";
  const emailId = payload.data?.email_id;
  if (typeof emailId !== "string" || emailId.length === 0 || emailId.length > 100) return "invalid";

  const occurredAt =
    toDate(type === "email.clicked" ? payload.data?.click?.timestamp : null) ?? toDate(payload.created_at);
  const linkPath = type === "email.clicked" ? sanitizeLinkPath(payload.data?.click?.link) : null;

  const result = await deps.store.applyEvent({
    webhookId,
    eventType: type,
    resendEmailId: emailId,
    occurredAt,
    linkPath,
  });
  console.log("[member-mail] webhook", { type, result });

  if (result === "suppressed") {
    if (type === "email.complained") {
      await deps.store.autoStop("complained", deps.now());
      await deps.notifyOps({
        title: "迷惑メール報告が来たため、全体のスイッチを止めました",
        counts: { complained: 1 },
        note: "文面と対象を見直してから member_mail_settings.mode を戻してください（264 §5-11）。この人には以後送りません。",
      });
    } else {
      await deps.notifyOps({
        title: "届かなかったメールがありました",
        counts: { bounced: 1 },
        note: "この人には以後送りません。1回の送信で5%を超えたら止めてください（264 §5-11）。",
      });
    }
  }
  return result;
}
