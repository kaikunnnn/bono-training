import "server-only";

/**
 * BONO と Slack をつなぐ処理（#263）。Server Action から呼ぶ本体（テストのため依存は引数で受ける）。
 *
 * (b) DM のリンク（/slack/link?t=…）: ログイン中の BONO ユーザーと、リンクの Slack ユーザーをつなぐ
 *     - リンクの値はハッシュで引く。確認・つなぐ・無効化は SQL 関数の1トランザクション
 *     - 課金中でない BONO アカウントではつながない（リンクは無効化しない。正しいアカウントでやり直せる）
 *     - 上書きしない（どちらかが別とつながっていれば断る）。ただし Slack 側のつながりの相手が
 *       課金中でない（いない）ときは、ログイン中の課金中アカウントでつなぎ直す（SQL 関数で判定）
 * (c) マイページの「Slackとつなぐ」: 入力されたメールで users.lookupByEmail → いればその人に確認DM
 *     - Slack にいてもいなくても同じ文を返す（誰が Slack にいるかを調べられないように）
 *     - メールは保存しない・ログに出さない
 *     - 1日3回まで（slack_link_tokens の purpose=mypage の行数で数える。該当者なしの申し込みも行を残す）
 *     - test モードでは test_bono_user_ids の BONO ユーザーだけが使え、DM は test_user_ids の人にだけ送る。
 *       off / dry_run では受け付けない
 */
import { excludedReasonOf } from "./classify";
import type { LinkPageStatus, MypageLinkStatus } from "./link-copy";
import { renderSyncMessage, type SyncMessage } from "./messages/common";
import type { SyncSlackClient } from "./slack-api";
import { hashToken, isPlausibleToken, linkUrl, MYPAGE_TOKEN_TTL_MS } from "./tokens";
import type { LinkStore, SubscriptionSummary, SyncSettings } from "./types";

/** マイページからの申し込みの上限（24時間あたり） */
export const MYPAGE_DAILY_LIMIT = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPaidActive(sub: SubscriptionSummary | null): boolean {
  return Boolean(sub && sub.hasPaidRecord && sub.isActive);
}

/** 課金中、または手で残すと決めた BONO ユーザー（settings.keep_user_ids）か */
export async function isPaidForLink(store: LinkStore, userId: string, settings?: SyncSettings | null): Promise<boolean> {
  const s = settings === undefined ? await store.getSettings() : settings;
  if (s?.keepUserIds.includes(userId)) return true;
  return isPaidActive(await store.getSubscription(userId));
}

/** ページを開いたときの表示（リンクは無効化しない） */
export async function inspectLinkToken(store: LinkStore, raw: string | null): Promise<"valid" | LinkPageStatus> {
  if (!isPlausibleToken(raw)) return "invalid";
  const state = await store.peekToken(hashToken(raw));
  return state;
}

/** 「つなぐ」ボタンを押したとき */
export async function confirmLink(store: LinkStore, raw: string | null, userId: string): Promise<LinkPageStatus> {
  if (!isPlausibleToken(raw)) return "invalid";
  if (!(await isPaidForLink(store, userId))) {
    // リンクが有効かを先に伝えたほうが分かりやすい（無効なリンクで「課金が確認できない」と出さない）
    const state = await store.peekToken(hashToken(raw));
    return state === "valid" ? "not_paid" : state;
  }
  return store.claimLink(hashToken(raw), userId);
}

/**
 * マイページの「Slackとつなぐ」を使える人か。
 * live: 全員 / test: settings.test_bono_user_ids の BONO ユーザーだけ / off・dry_run: 誰も使えない
 * （test の間に本番の会員にカードを見せないため。Slack ID は入力されるまで分からないので BONO の ID で絞る）
 */
export function canUseMypageCard(settings: SyncSettings | null, userId: string): boolean {
  if (!settings) return false;
  if (settings.mode === "live") return true;
  return settings.mode === "test" && settings.testBonoUserIds.includes(userId);
}

/** その Slack ユーザーが、別の課金中（手で残す人を含む）の BONO ユーザーとつながっているか */
async function isLinkedToOtherPaid(
  store: LinkStore,
  teamId: string,
  slackUserId: string,
  userId: string,
  settings: SyncSettings,
): Promise<boolean> {
  const linked = await store.getLinkedUserId(teamId, slackUserId);
  if (!linked || linked === userId) return false;
  return isPaidForLink(store, linked, settings);
}

export interface MypageLinkDeps {
  store: LinkStore;
  slack: SyncSlackClient;
  teamId: string;
  siteUrl: string;
  message: SyncMessage;
  now: () => Date;
  newToken: () => string;
}

function log(event: string, extra?: Record<string, unknown>) {
  // メール・名前・Slack ID は出さない
  console.log(`[slack-member-sync] mypage ${event}`, extra ?? {});
}

/** マイページの「Slackとつなぐ」 */
export async function requestMypageLink(
  deps: MypageLinkDeps,
  userId: string,
  emailInput: string,
): Promise<MypageLinkStatus> {
  const email = emailInput.trim();
  if (email.length === 0 || email.length > 254 || !EMAIL_RE.test(email)) return "invalid_email";

  const settings = await deps.store.getSettings();
  if (!settings || !canUseMypageCard(settings, userId)) return "unavailable";
  if (!(await isPaidForLink(deps.store, userId, settings))) return "not_paid";
  if (await deps.store.getLinkByUserId(userId)) return "already_linked";

  const now = deps.now();
  const count = await deps.store.countMypageRequests(userId, new Date(now.getTime() - 24 * 60 * 60 * 1000));
  if (count >= MYPAGE_DAILY_LIMIT) return "rate_limited";

  // Slack にその人がいて、DM してよいか（結果は呼び出し側に返さない）
  const raw = deps.newToken();
  let target: string | null = null;
  let skip: string | null = null;
  const found = await deps.slack.lookupByEmail(email);
  if (found.kind !== "ok") {
    skip = found.kind === "slack_error" ? found.error : found.kind;
  } else if (excludedReasonOf(found.data, deps.teamId) !== null) {
    skip = "excluded";
  } else if (await isLinkedToOtherPaid(deps.store, deps.teamId, found.data.id, userId, settings)) {
    // 別の課金中のアカウントとつながっている（課金中でない・いないアカウントとのつながりは、つなぎ直せる）
    skip = "slack_already_linked";
  } else if (settings.mode === "test" && !settings.testUserIds.includes(found.data.id)) {
    skip = "not_test_target";
  } else {
    target = found.data.id;
  }

  const rendered = target ? renderSyncMessage(deps.message, { link: linkUrl(deps.siteUrl, raw) }) : null;
  if (rendered && !rendered.ok) {
    skip = rendered.reason;
    target = null;
  }

  // 申し込み1回につき1行（回数の数え方を兼ねる）。送らない場合は slack_user_id=NULL の使えない行
  await deps.store.insertLinkToken({
    tokenHash: hashToken(raw),
    teamId: deps.teamId,
    slackUserId: target,
    purpose: "mypage",
    expiresAt: new Date(now.getTime() + MYPAGE_TOKEN_TTL_MS),
    requestedByUserId: userId,
  });

  if (!target || !rendered || !rendered.ok) {
    log("skipped", { reason: skip });
    return "sent";
  }
  const opened = await deps.slack.openDm(target);
  if (opened.kind !== "ok") {
    log("dm_open_failed", { code: opened.kind === "slack_error" ? opened.error : opened.kind });
    return "sent";
  }
  const posted = await deps.slack.postMessage(opened.data.channelId, rendered.text);
  log(posted.kind === "ok" ? "dm_sent" : "dm_post_failed", {
    code: posted.kind === "slack_error" ? posted.error : posted.kind,
  });
  return "sent";
}
