import "server-only";

/**
 * 環境変数から実行時の依存（store / Slack クライアント等）を組み立てる（#238）。
 * 値はリクエスト時に読む（ビルド時に未設定でも落ちないように）。
 *
 * 環境変数:
 * - SLACK_WELCOME_SIGNING_SECRET … Slack アプリの Signing Secret
 * - SLACK_WELCOME_BOT_TOKEN      … xoxb-（scope: users:read）
 * - SLACK_WELCOME_USER_TOKEN     … カイクンの xoxp-（user scope: im:write, chat:write）
 * - SLACK_WELCOME_TEAM_ID        … BONO の Slack ワークスペースID（T...）
 * - SLACK_WELCOME_APP_ID         … Slack アプリID（A...）
 */
import { randomUUID } from "node:crypto";
import type { IngestConfig } from "./ingest";
import { WELCOME_MESSAGE } from "./message";
import { notifyOps } from "./ops-alert";
import type { WelcomeDeps } from "./process";
import { createSlackClient } from "./slack-api";
import { createWelcomeStoreFromEnv } from "./store";
import type { WelcomeStore } from "./types";

export function loadIngestConfig(): IngestConfig {
  return {
    signingSecret: process.env.SLACK_WELCOME_SIGNING_SECRET ?? "",
    teamId: process.env.SLACK_WELCOME_TEAM_ID ?? "",
    appId: process.env.SLACK_WELCOME_APP_ID ?? "",
  };
}

export function getWelcomeStore(): WelcomeStore | null {
  return createWelcomeStoreFromEnv();
}

/** 送信処理の依存。トークン等が足りなければ null */
export function createWelcomeDeps(store: WelcomeStore | null): WelcomeDeps | null {
  const botToken = process.env.SLACK_WELCOME_BOT_TOKEN;
  const userToken = process.env.SLACK_WELCOME_USER_TOKEN;
  const teamId = process.env.SLACK_WELCOME_TEAM_ID;
  if (!store || !botToken || !userToken || !teamId) return null;
  return {
    store,
    slack: createSlackClient({ botToken, userToken }),
    teamId,
    message: WELCOME_MESSAGE,
    notifyOps,
    now: () => new Date(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    newToken: () => randomUUID(),
  };
}
