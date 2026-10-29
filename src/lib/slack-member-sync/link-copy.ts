/**
 * つなぐページ（/slack/link）・アカウント情報の「Slackとつなぐ」（/account/slack）の文言（#263）。純粋なデータ（クライアントからも import 可）。
 */

export type LinkPageStatus =
  | "linked"
  | "already_linked"
  | "invalid"
  | "used"
  | "expired"
  | "slack_linked_to_other"
  | "user_linked_to_other"
  | "not_paid"
  | "conflict"
  | "unavailable";

const CONTACT = "つなぎ直したいときは、Slackでカイクンに連絡してください。";
const RETRY = "アカウント情報の「Slackとつなぐ」から、もう一度やり直してください。";

export const LINK_PAGE_COPY: Record<LinkPageStatus, { title: string; body: string; ok: boolean }> = {
  linked: {
    ok: true,
    title: "つながりました",
    body: "SlackとBONOのアカウントがつながりました。このページは閉じてかまいません。",
  },
  already_linked: {
    ok: true,
    title: "すでにつながっています",
    body: "このSlackアカウントとBONOのアカウントは、すでにつながっています。このページは閉じてかまいません。",
  },
  invalid: {
    ok: false,
    title: "このリンクは使えません",
    body: `リンクが正しくないようです。DMのリンクをもう一度開くか、${RETRY}`,
  },
  used: {
    ok: false,
    title: "このリンクは使用済みです",
    body: `このリンクはすでに使われています。${RETRY}`,
  },
  expired: {
    ok: false,
    title: "このリンクは有効期限が切れています",
    body: RETRY,
  },
  slack_linked_to_other: {
    ok: false,
    title: "別のBONOアカウントとつながっています",
    body: `このSlackアカウントは、別のBONOアカウントとすでにつながっています。${CONTACT}`,
  },
  user_linked_to_other: {
    ok: false,
    title: "別のSlackアカウントとつながっています",
    body: `ログイン中のBONOアカウントは、別のSlackアカウントとすでにつながっています。${CONTACT}`,
  },
  not_paid: {
    ok: false,
    title: "メンバーシップが確認できません",
    body: "ログイン中のBONOアカウントでは、課金中のメンバーシップが確認できませんでした。メンバー登録しているアカウントでログインし直してください。",
  },
  conflict: {
    ok: false,
    title: "つなげませんでした",
    body: "同時に別の操作があったため、つなげませんでした。少し時間をおいて、もう一度リンクを開いてください。",
  },
  unavailable: {
    ok: false,
    title: "いまはつなげません",
    body: "時間をおいて、もう一度お試しください。",
  },
};

/** アカウント情報の「Slackとつなぐ」（/account/slack）の結果 */
export type MypageLinkStatus = "sent" | "invalid_email" | "rate_limited" | "already_linked" | "not_paid" | "unavailable";

export const MYPAGE_LINK_COPY: Record<MypageLinkStatus, string> = {
  // Slack にそのメールの人がいてもいなくても同じ文を返す（誰が Slack にいるかを調べられないように）
  sent: "入力したメールアドレスのSlackアカウントがあれば、カイクンから確認のDMが届きます。DMのリンクを開いて、BONOにログインしてください（24時間有効）。",
  invalid_email: "メールアドレスの形を確かめてください。",
  rate_limited: "今日はこれ以上送れません。明日もう一度お試しください。",
  already_linked: "このBONOアカウントは、すでにSlackとつながっています。",
  not_paid: "課金中のメンバーシップが確認できませんでした。",
  unavailable: "いまは受け付けていません。時間をおいて、もう一度お試しください。",
};
