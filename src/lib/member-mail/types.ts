/**
 * 会員メール（#264 スライス1）の共通型・定数。純粋な型と定数だけ（どこからでも import 可）。
 * テーブル: supabase/migrations/20261123000000_create_member_mail.sql
 */

/** off: 止める / count: 人数だけ出す / owner: オーナーだけに送る / all: 全員に送る */
export const MAIL_MODES = ["off", "count", "owner", "all"] as const;
export type MailMode = (typeof MAIL_MODES)[number];

/** メールの種類（264 §4・268） */
export const MAIL_KINDS = ["weekly", "comeback", "renewal", "signup", "winback"] as const;
export type MailKind = (typeof MAIL_KINDS)[number];

/** 配信停止のカテゴリ（264 §5-7） */
export const MAIL_CATEGORIES = ["notice", "comeback", "signup", "winback"] as const;
export type MailCategory = (typeof MAIL_CATEGORIES)[number];

export const CATEGORY_OF_KIND: Record<MailKind, MailCategory> = {
  weekly: "notice",
  comeback: "comeback",
  renewal: "comeback",
  signup: "signup",
  winback: "winback",
};

/**
 * リンクに付ける印（264 §5-10 `?from=email_xxx`）。
 *
 * 会員の様子を見て送り分けていることは、会員に見える URL に出さない（オーナー決定・327-D）。
 * そのため週1回のメルマガ以外は、中身を推測しにくい中立な名前にする（意味はこの表でだけ分かる）。
 * - 記録側（parseEmailFrom・活動ログの email_click）は `email_` + 英小文字1〜30字しか通さない。数字・記号は使えない
 * - 一度メールに載せた印は変えない（古いメールのリンクの記録が分からなくなるため）。新しく足すときは未使用の名前にする
 *
 * 対応表（分析で読み替えるときの正）:
 *   email_weekly … 週1回のメルマガ（weekly）
 *   email_px     … comeback（しばらく来ていない人へ）
 *   email_pw     … renewal（3ヶ月プランの相談案内）
 *   email_pv     … signup（常設の文面ではない signup の回）
 *   email_pu     … winback（以前の会員へ）
 *   email_pt     … はじめの案内（常設の文面 onboarding_day2・327-D）
 *   email_ps     … 続きをデザインしよう（常設の文面 onboarding_day5・327-E）
 *   email_pr     … 30分相談の案内（常設の文面 onboarding_day9・327-F）
 * 以前の名前（email_comeback / email_renewal / email_signup / email_winback）は、この変更より前に送ったメールにだけ残る。
 */
export const FROM_OF_KIND: Record<MailKind, string> = {
  weekly: "email_weekly",
  comeback: "email_px",
  renewal: "email_pw",
  signup: "email_pv",
  winback: "email_pu",
};

/**
 * 常設の文面（327-D〜）。毎日、条件に合った人だけを送信の記録に足す。
 * member_mail_campaigns.standing_key に入れる値。1つの key に文面は1つだけ（DB の一意インデックス）。
 *   onboarding_day2 … 327-D はじめの案内（入会2日後の朝）
 *   onboarding_day5 … 327-E 続きをデザインしよう（入会5日後の朝）
 *   onboarding_day9 … 327-F 30分相談の案内（入会9日後の朝）
 */
export const STANDING_KEYS = ["onboarding_day2", "onboarding_day5", "onboarding_day9"] as const;
export type StandingKey = (typeof STANDING_KEYS)[number];

/** 常設の文面のリンクの印（FROM_OF_KIND より優先。D・E・F で押した記録を分けるため） */
export const FROM_OF_STANDING: Record<StandingKey, string> = {
  onboarding_day2: "email_pt",
  onboarding_day5: "email_ps",
  onboarding_day9: "email_pr",
};

export function isStandingKey(value: unknown): value is StandingKey {
  return typeof value === "string" && (STANDING_KEYS as readonly string[]).includes(value);
}

/**
 * 会員の「週1通まで」に数えるカテゴリ（264 §5-9: お知らせ系 ①②と相談案内を合わせて週1通）
 */
export const WEEKLY_CAP_CATEGORIES: readonly MailCategory[] = ["notice", "comeback"];

/**
 * ワンクリック（メールソフトの「配信停止」ボタン）と画面の「止める」で止める範囲。
 * 264 §5-8 のおすすめ「その人が受け取りうるお知らせ系の全カテゴリを止める」に合わせる。
 * 268 の未決Q（全部か、その種類だけか）が「その種類だけ」に決まったら、ここを "category" に変える。
 */
export const UNSUBSCRIBE_SCOPE: "all" | "category" = "all";

export type DeliveryStatus =
  | "queued"
  | "processing"
  | "sending"
  | "sent"
  | "skipped"
  | "needs_review"
  | "failed";

export type Audience = "owner" | "all";

export type UnsubscribeMethod = "link" | "one_click" | "reply" | "manual";

export interface MailSettings {
  mode: MailMode;
  ownerUserIds: string[];
  dailyLimit: number;
  sendHourStart: number;
  sendHourEnd: number;
}

export interface Campaign {
  id: string;
  kind: MailKind;
  label: string;
  subject: string;
  preheader: string;
  body: string;
  contentVersion: number;
  approvedVersion: number | null;
  /**
   * 1回分の文面（weekly など）: 送り始めてよい時刻。
   * 常設の文面: 仕組みを有効にした時刻。この時刻より後に入会した人だけが対象（過去の入会者にさかのぼらない）。NULL なら何もしない
   */
  scheduledAt: Date | null;
  enqueuedAt: Date | null;
  /** 常設の文面の種類（327-D）。null / 未設定なら1回分の文面 */
  standingKey?: StandingKey | null;
  /** 人数だけ出した最後の時刻（常設の文面で、1日に何度も数えて Slack に出さないため） */
  lastCountedAt?: Date | null;
}

/** 対象を選ぶときの候補（課金の状態の表から。名前・アドレスは持たない） */
export interface MemberCandidate {
  userId: string;
  planType: string | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean;
  /**
   * user_subscriptions.created_at（在籍月数の目安だけに使う）。
   * ★入会日には使わない。アカウントを作った時点でトリガー（on_auth_user_created_subscription）が行を作るため、
   *   課金よりずっと前の日付になることがある（327-D レビュー。本番で 10月以降の新規24人中11人が30日以上前）
   */
  createdAt: Date | null;
  /** 今の Stripe 契約の ID（user_subscriptions.stripe_subscription_id）。常設の文面の入会日を引くのに使う */
  stripeSubscriptionId?: string | null;
}

/**
 * 「学んだ」を判定するための活動ログ1行（member_activity_events）。
 * rebono/99_analytics/health_check の engagement.py（#262・#274）と同じ列を読む。
 */
export interface ProgressEvent {
  userId: string;
  eventType: string;
  articleId: string | null;
  lessonId: string | null;
  occurredAt: Date;
  /** meta->>'percent'（文字のまま。数値に読めない値は「学んだ」に入れない） */
  percent: string | null;
}

export interface DeliveryRow {
  id: string;
  campaignId: string;
  userId: string;
  kind: MailKind;
  category: MailCategory;
  audience: Audience;
  contentVersion: number;
  status: DeliveryStatus;
  attempts: number;
}

export interface NewDelivery {
  campaignId: string;
  userId: string;
  kind: MailKind;
  category: MailCategory;
  audience: Audience;
  contentVersion: number;
}

export interface DeliveryPatch {
  status?: DeliveryStatus;
  reason?: string | null;
  attempts?: number;
  nextAttemptAt?: Date;
  resendEmailId?: string | null;
  contentVersion?: number;
  sendingAt?: Date | null;
  sentAt?: Date | null;
  /** true のとき claim_token / locked_until を消す（処理を手放す） */
  release?: boolean;
}

/**
 * 永続化層。失敗時は例外を投げる。
 * 実装: Supabase（store.ts）、テスト用のインメモリ実装。
 */
export interface MailStore {
  getSettings(): Promise<MailSettings | null>;
  getKindMode(kind: MailKind): Promise<MailMode>;
  /** 自動で全体を止める（迷惑メール報告など） */
  autoStop(reason: string, at: Date): Promise<void>;
  /** 送る処理の実行ロック。取れたら true */
  acquireRunLock(now: Date, until: Date): Promise<boolean>;
  releaseRunLock(): Promise<void>;

  getCampaign(id: string): Promise<Campaign | null>;
  /** scheduled_at <= now（7日以内）で、まだ全員分を書き出していない文面 */
  listDueCampaigns(now: Date): Promise<Campaign[]>;
  markEnqueued(campaignId: string, at: Date): Promise<void>;
  saveCount(campaignId: string, count: CountSummary, at: Date): Promise<void>;

  /** 課金中の会員（live・is_active・stripe_subscription_id あり） */
  listPaidMembers(): Promise<MemberCandidate[]>;
  /** 送る直前の確認用（契約が終わった人には送らない） */
  isPaidMember(userId: string): Promise<boolean>;
  /** 指定カテゴリを配信停止中の user_id */
  listUnsubscribedUserIds(category: MailCategory): Promise<Set<string>>;
  isUnsubscribed(userId: string, category: MailCategory): Promise<boolean>;
  /** 届かなかった・迷惑報告で以後送らない user_id */
  listSuppressedUserIds(): Promise<Set<string>>;
  isSuppressed(userId: string): Promise<boolean>;
  /** since 以降に、campaign 以外で categories のメールを送った（送信中を含む）user_id（本番の送信だけ） */
  listUsersMailedSince(since: Date, categories: readonly MailCategory[], excludeCampaignId: string): Promise<Set<string>>;
  hasMailedSince(
    userId: string,
    since: Date,
    categories: readonly MailCategory[],
    excludeCampaignId: string,
  ): Promise<boolean>;
  /** since 以降に送った（送信中・要確認を含む）通数 */
  countSentSince(since: Date): Promise<number>;

  // ----- 常設の文面（327-D） -----
  /** standing_key があり、scheduled_at（有効にした時刻）<= now の文面 */
  listStandingCampaigns(now: Date): Promise<Campaign[]>;
  /** 課金中の会員1人（送る直前の確認用）。いなければ null */
  getPaidMember(userId: string): Promise<MemberCandidate | null>;
  /**
   * 常設の文面の「入会日」= 今の Stripe 契約の最初の課金日。
   * public.subscriptions（environment='live'）の、その stripe_subscription_id の min(start_timestamp)。
   * start_timestamp は stripe-webhook が契約を初めて記録したとき（checkout.session.completed / subscription.created）の
   * current_period_start で、更新・プラン変更（同じ契約ID）では書き換わらない。行が無い（決済が終わっていない）契約は入らない。
   * since 以降に始まった契約だけを、契約ID → 最初の課金日 で返す（min は since より前の行も含めて取る）
   */
  listContractStartsSince(since: Date): Promise<Map<string, Date>>;
  /** 契約1つの最初の課金日（送る直前の確認用）。行が無ければ null */
  getContractStart(stripeSubscriptionId: string): Promise<Date | null>;
  /**
   * since 以降に、常設の文面（standing_key あり）を本番で送った（送信中・要確認を含む）通数を人ごとに。
   * 14日で最大3通の上限に使う
   */
  countStandingMailsSince(since: Date, userIds: readonly string[]): Promise<Map<string, number>>;
  /** 「学んだ」の判定に使う活動ログ（userIds の、since 以降の進めた系の行だけ） */
  listProgressEvents(userIds: readonly string[], since: Date): Promise<ProgressEvent[]>;
  /** テスト用アカウントとして外すメールアドレスの頭（member_mail_settings.test_email_prefixes） */
  getTestEmailPrefixes(): Promise<string[]>;

  /** 一意制約つき INSERT（既にあれば何もしない）。新しく入った件数を返す */
  insertDeliveries(rows: NewDelivery[]): Promise<number>;
  /** campaignIds を渡すと、その文面の行だけ（毎日の実行で常設の文面だけ送るため） */
  listDueDeliveryIds(now: Date, limit: number, campaignIds?: readonly string[]): Promise<string[]>;
  /** 条件付き UPDATE ... RETURNING で1行を確保する。確保できなければ null */
  claim(id: string, now: Date, lockedUntil: Date, token: string): Promise<DeliveryRow | null>;
  /** claim_token と status が一致するときだけ更新する */
  update(id: string, token: string, expectedStatus: DeliveryStatus, patch: DeliveryPatch): Promise<boolean>;
  /** updated_at が olderThan より古い sending を needs_review にし、件数を返す */
  markStaleSending(olderThan: Date): Promise<number>;

  /** 送る直前にだけ使う。アドレスは記録・ログに残さない */
  getEmailAddress(userId: string): Promise<string | null>;
}

/** 配信停止の画面・ワンクリック・webhook が使う永続化 */
export interface UnsubscribeStore {
  /** 止める（すでに止まっていれば記録を変えない）。止めたカテゴリの数を返す */
  unsubscribe(userId: string, categories: readonly MailCategory[], method: UnsubscribeMethod, at: Date): Promise<void>;
  /** 戻す */
  resubscribe(userId: string, category: MailCategory, at: Date): Promise<void>;
  /** 今止まっているカテゴリ */
  listStoppedCategories(userId: string): Promise<MailCategory[]>;
}

export type WebhookApplyResult = "duplicate" | "unknown" | "recorded" | "suppressed";

export interface WebhookStore {
  applyEvent(input: {
    webhookId: string;
    eventType: string;
    resendEmailId: string;
    occurredAt: Date | null;
    linkPath: string | null;
  }): Promise<WebhookApplyResult>;
  autoStop(reason: string, at: Date): Promise<void>;
}

/** 人数だけ出す結果。人数と区分だけで、名前・アドレス・user_id は入れない */
export interface CountSummary {
  kind: MailKind;
  mode: MailMode;
  approved: boolean;
  candidates: number;
  willSend: number;
  excluded: Record<string, number>;
  byPlan: Record<string, number>;
  byTenure: Record<string, number>;
  cancelScheduled: number;
}

/** Resend への送信結果 */
export type SendResult =
  | { kind: "ok"; id: string }
  /** 断られたことが確実（送られていない） */
  | { kind: "rejected"; code: string; stopBatch: boolean }
  /** 速さ・1日の上限（送られていない。あとで送り直してよい） */
  | { kind: "throttled"; code: string }
  /** 送れたか分からない（自動で送り直さない） */
  | { kind: "ambiguous"; code: string };

export interface OutgoingMail {
  to: string;
  from: string;
  replyTo: string | null;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
  idempotencyKey: string;
  tags: { name: string; value: string }[];
}

export interface MailClient {
  send(mail: OutgoingMail): Promise<SendResult>;
}
