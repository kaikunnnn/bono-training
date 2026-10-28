import "server-only";

/**
 * 環境変数から実行時の依存（store / Slack クライアント等）を組み立てる（#263）。
 * 値はリクエスト時に読む（ビルド時に未設定でも落ちないように）。
 *
 * Slack アプリは #238 の「BONO Welcome」を使い回す（アプリ枠を増やさない）。新しい環境変数はない:
 * - SLACK_WELCOME_BOT_TOKEN  … xoxb-（scope: users:read, users:read.email ← #263 で追加）
 * - SLACK_WELCOME_USER_TOKEN … カイクンの xoxp-（user scope: im:write, chat:write）。DM の送り主・報告の宛先
 * - SLACK_WELCOME_TEAM_ID    … BONO の Slack ワークスペースID（T...）
 * - NEXT_PUBLIC_SITE_URL     … 使い捨てリンクの URL の元（未設定なら https://www.bo-no.design）
 * - SLACK_OPS_WEBHOOK_URL    … 運用アラート（件数だけ）
 *
 * 課金の照合は environment='live' の行だけを見る（SQL 関数で固定。Slack のメンバーは本番だけの概念のため）。
 * NODE_ENV で test / live を切り替える getSubscriptionStatus とは違うので、ローカルで通しで試すときは
 * テスト用ユーザーに environment='live' かつ stripe_subscription_id のある user_subscriptions 行を作る。
 */
import { LINK_REQUEST_MESSAGE } from "./messages/link-request";
import { OWNER_REPORT_MESSAGE } from "./messages/owner-report";
import { REMOVAL_NOTICE_MESSAGE } from "./messages/removal-notice";
import { siteUrl } from "./messages/common";
import { notifySyncOps } from "./ops-alert";
import type { SyncDeps } from "./process";
import { createSyncSlackClient, type SyncSlackClient } from "./slack-api";
import { createSyncStoreFromEnv } from "./store";
import { newRawToken } from "./tokens";
import type { LinkStore, SyncStore } from "./types";

export function getSyncStore(): (SyncStore & LinkStore) | null {
  return createSyncStoreFromEnv();
}

/** Slack のトークン類。足りなければ null */
export function loadSlackConfig(): { botToken: string; userToken: string; teamId: string } | null {
  const botToken = process.env.SLACK_WELCOME_BOT_TOKEN;
  const userToken = process.env.SLACK_WELCOME_USER_TOKEN;
  const teamId = process.env.SLACK_WELCOME_TEAM_ID;
  if (!botToken || !userToken || !teamId) return null;
  return { botToken, userToken, teamId };
}

export function getSyncSlackClient(): { slack: SyncSlackClient; teamId: string } | null {
  const config = loadSlackConfig();
  if (!config) return null;
  return { slack: createSyncSlackClient(config), teamId: config.teamId };
}

/** 日次処理の依存。DB・トークン等が足りなければ null */
export function createSyncDeps(store: SyncStore | null): SyncDeps | null {
  const slack = getSyncSlackClient();
  if (!store || !slack) return null;
  return {
    store,
    slack: slack.slack,
    teamId: slack.teamId,
    messages: {
      linkRequest: LINK_REQUEST_MESSAGE,
      removalNotice: REMOVAL_NOTICE_MESSAGE,
      ownerReport: OWNER_REPORT_MESSAGE,
    },
    notifyOps: notifySyncOps,
    siteUrl: siteUrl(),
    now: () => new Date(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    newToken: newRawToken,
  };
}
