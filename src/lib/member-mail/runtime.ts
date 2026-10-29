import "server-only";

/**
 * 環境変数から実行時の依存を組み立てる（#264）。値はリクエスト時に読む（ビルド時に未設定でも落ちないように）。
 *
 * 環境変数:
 * - SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL … 記録の読み書き（必須）
 * - MEMBER_MAIL_UNSUBSCRIBE_SECRET … 配信停止リンクの署名の鍵（32文字以上。必須。変えると古いメールのリンクが無効になる）
 * - RESEND_API_KEY                 … Resend の鍵（無いと送る処理だけ止まる。人数だけ出すは動く）
 * - MEMBER_MAIL_FROM               … 送り主（例: カイくん <kai@mail.bo-no.design>。無いと送る処理だけ止まる）
 * - MEMBER_MAIL_REPLY_TO           … 返信先（オーナーに届くアドレス。任意）
 * - MEMBER_MAIL_SANDBOX_TO         … ローカル確認用。設定すると宛先をすべてこのアドレスに差し替える（本番では設定しない）
 * - RESEND_WEBHOOK_SECRET          … Resend の webhook の署名の鍵（whsec_...）
 * - NEXT_PUBLIC_SITE_URL           … リンクの元（未設定なら https://www.bo-no.design）
 * - SLACK_OPS_WEBHOOK_URL          … 運用 Slack（件数だけ）
 */
import { randomUUID } from "node:crypto";
import { siteUrl } from "@/lib/slack-member-sync/messages/common";
import { notifyMailOps } from "./ops-alert";
import type { MailDeps } from "./process";
import { createResendMailClient } from "./resend-client";
import { createMailStoreFromEnv, type SupabaseMailStore } from "./store";

export function getMailStore(): SupabaseMailStore | null {
  return createMailStoreFromEnv();
}

export function getUnsubscribeSecret(): string | null {
  const secret = process.env.MEMBER_MAIL_UNSUBSCRIBE_SECRET ?? "";
  return secret.length >= 32 ? secret : null;
}

/** 送る処理の依存。記録・署名の鍵が足りなければ null。Resend の鍵・送り主が無ければ mail が null */
export function createMailDeps(store: SupabaseMailStore | null = getMailStore()): MailDeps | null {
  const unsubscribeSecret = getUnsubscribeSecret();
  if (!store || !unsubscribeSecret) return null;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MEMBER_MAIL_FROM ?? "";
  const mail = apiKey && from ? createResendMailClient(apiKey, { sandboxTo: process.env.MEMBER_MAIL_SANDBOX_TO || null }) : null;
  return {
    store,
    mail,
    notifyOps: notifyMailOps,
    now: () => new Date(),
    newToken: () => randomUUID(),
    siteUrl: siteUrl(),
    from,
    replyTo: process.env.MEMBER_MAIL_REPLY_TO || null,
    unsubscribeSecret,
  };
}
