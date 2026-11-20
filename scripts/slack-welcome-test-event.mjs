// Slack ウェルカムDM（#238 / #298）の動作確認用。
// 「この人がSlackに入った」という team_join を、Slack と同じ署名を付けて本番の受け口に送る。
// 本物の参加を待たずに、受け取り → 対象判定 → 記録（dry_run）/ 送信（test）までを通せる。
//
// 使い方:
//   1. .env.slack-welcome-test.local（git 管理外）に次の3行を書く
//        SLACK_WELCOME_SIGNING_SECRET=...   ← Slackアプリ「Basic Information」の Signing Secret
//        SLACK_WELCOME_TEAM_ID=T01ERLQ4GJD
//        SLACK_WELCOME_APP_ID=A0C9L174Q0G
//   2. node scripts/slack-welcome-test-event.mjs <SlackのユーザーID>
//      例: node scripts/slack-welcome-test-event.mjs U0XXXXXXX
//
// 注意:
//   - 本番のスイッチが live のときは、指定した人に本当にDMが届く。live では使わない
//   - 同じ人には1回しか記録されない（2回目は duplicate で何もしない）。やり直すときは記録の行を消す
//   - 送れるのは署名の鍵を知っている人だけ。鍵はチャットやコミットに貼らない
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const ENDPOINT = process.env.SLACK_WELCOME_TEST_ENDPOINT || "https://www.bo-no.design/api/slack/welcome/events";
const ENV_FILE = ".env.slack-welcome-test.local";

function loadEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return {};
  }
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const fileEnv = loadEnvFile(ENV_FILE);
const get = (key) => process.env[key] || fileEnv[key] || "";
const signingSecret = get("SLACK_WELCOME_SIGNING_SECRET");
const teamId = get("SLACK_WELCOME_TEAM_ID");
const appId = get("SLACK_WELCOME_APP_ID");

const userId = process.argv[2];
if (!userId || !/^[UW][A-Z0-9]{2,30}$/.test(userId)) {
  console.error("SlackのユーザーID（U から始まる）を1つ指定してください。例: node scripts/slack-welcome-test-event.mjs U0XXXXXXX");
  process.exit(1);
}
if (!signingSecret || !teamId || !appId) {
  console.error(`${ENV_FILE} に SLACK_WELCOME_SIGNING_SECRET / SLACK_WELCOME_TEAM_ID / SLACK_WELCOME_APP_ID を書いてください。`);
  process.exit(1);
}

const nowSec = Math.floor(Date.now() / 1000);
// event_id は TEST- 始まりにして、本物の参加と見分けられるようにする
const body = JSON.stringify({
  token: "unused",
  team_id: teamId,
  api_app_id: appId,
  type: "event_callback",
  event_id: `TEST-${randomUUID()}`,
  event_time: nowSec,
  event: { type: "team_join", user: { id: userId } },
});
const timestamp = String(nowSec);
const signature = `v0=${createHmac("sha256", signingSecret).update(`v0:${timestamp}:${body}`).digest("hex")}`;

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Slack-Request-Timestamp": timestamp,
    "X-Slack-Signature": signature,
  },
  body,
  redirect: "error",
  signal: AbortSignal.timeout(30_000),
});
const text = await res.text();

const meanings = {
  '{"ok":true}': "受け取って記録しました。数秒後に判定が終わります",
  '{"ignored":"off"}': "スイッチが off なので何もしていません",
  '{"ignored":"before_enabled_from"}': "開始時刻より前の参加として扱われました",
  '{"error":"invalid_signature"}': "署名が合いません。Signing Secret を確認してください",
  '{"error":"unexpected_team_or_app"}': "チームIDかアプリIDが違います",
};
console.log(`HTTP ${res.status} ${text}`);
if (meanings[text]) console.log(`→ ${meanings[text]}`);
process.exit(res.ok ? 0 : 1);
