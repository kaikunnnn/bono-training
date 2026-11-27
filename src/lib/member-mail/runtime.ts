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
 * - CALCOM_WEBHOOK_SECRET          … Cal.com の webhook の署名の鍵（30分相談の予約。src/app/api/webhooks/calcom）
 * - CALCOM_CONSULT_EVENT_SLUG      … 30分相談の event type の slug（任意。未設定なら 30min）
 * - CALCOM_CONSULT_EVENT_TYPE_ID   … 30分相談の event type の ID（任意。設定すると ID でも突き合わせる）
 * - NEXT_PUBLIC_SITE_URL           … リンクの元（未設定なら https://www.bo-no.design）
 * - SLACK_OPS_WEBHOOK_URL          … 運用 Slack（件数だけ）
 * - SLACK_WELCOME_BOT_TOKEN / SLACK_WELCOME_USER_TOKEN / SLACK_WELCOME_TEAM_ID
 *                                  … 常設の文面の Slack DM（#327-H）。#238 のウェルカムDMと同じアプリ・同じ送り主（新しい鍵は無い）。
 *                                    無ければ DM は送らない（人数だけ出すは動く）
 */
import { randomUUID } from "node:crypto";
import { siteUrl } from "@/lib/slack-member-sync/messages/common";
import type { LessonIndex } from "./learned";
import { loadLessonIndexFromSanity } from "./lesson-index-source";
import { notifyMailOps } from "./ops-alert";
import type { MailDeps } from "./process";
import { createResendMailClient } from "./resend-client";
import { createMailStoreFromEnv, type SupabaseMailStore } from "./store";
import { createSlackClient } from "@/lib/slack-welcome/slack-api";
import { loadSlackConfig } from "@/lib/slack-member-sync/runtime";
import type { SlackDmDeps, SlackDmStore } from "./slack-dm";
import { createSlackDmStoreFromEnv } from "./slack-dm-store";

/** Slack の DM 1回の呼び出しの待ち時間（2回呼ぶので、関数の実行時間上限 60秒に収まるよう短めに） */
const SLACK_DM_TIMEOUT_MS = 5_000;

export function getSlackDmStore(): SlackDmStore | null {
  return createSlackDmStoreFromEnv();
}

/** BONO の Slack ワークスペースID（SLACK_WELCOME_TEAM_ID）。トークン類が揃っていなければ null */
export function getSlackTeamId(): string | null {
  return loadSlackConfig()?.teamId ?? null;
}

/** 常設の文面の Slack DM の依存（#327-H）。記録が無ければ null。トークンが無ければ slack が null */
export function createSlackDmDeps(): SlackDmDeps | null {
  const store = getSlackDmStore();
  if (!store) return null;
  const config = loadSlackConfig();
  return {
    store,
    slack: config
      ? createSlackClient({ botToken: config.botToken, userToken: config.userToken, timeoutMs: SLACK_DM_TIMEOUT_MS })
      : null,
    teamId: config?.teamId ?? null,
  };
}

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
  // 1回の実行の中では Sanity を1度だけ読む（失敗したら次の呼び出しで読み直す）
  let lessonIndex: Promise<LessonIndex> | null = null;
  const loadLessonIndex = () => {
    if (!lessonIndex) {
      lessonIndex = loadLessonIndexFromSanity().catch((error) => {
        lessonIndex = null;
        throw error;
      });
    }
    return lessonIndex;
  };
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
    loadLessonIndex,
    slackDm: createSlackDmDeps(),
    consultWebhookConfigured: (process.env.CALCOM_WEBHOOK_SECRET ?? "").length > 0,
  };
}
