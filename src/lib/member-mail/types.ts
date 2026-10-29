/**
 * 会員メール（#264 スライス1）の共通型・定数。純粋な型と定数だけ（どこからでも import 可）。
 * テーブル: supabase/migrations/20261029000000_create_member_mail.sql
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

/** リンクに付ける印（264 §5-10 `?from=email_xxx`） */
export const FROM_OF_KIND: Record<MailKind, string> = {
  weekly: "email_weekly",
  comeback: "email_comeback",
  renewal: "email_renewal",
  signup: "email_signup",
  winback: "email_winback",
};

/** 配信停止の画面で見せるカテゴリ名 */
export const CATEGORY_LABEL: Record<MailCategory, string> = {
  notice: "お知らせ（週1回のメルマガ・新しいコンテンツ・イベント）",
  comeback: "しばらく来ていないときのご案内・相談のご案内",
  signup: "登録した方へのご案内",
  winback: "以前の会員の方へのお知らせ",
};

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
  scheduledAt: Date | null;
  enqueuedAt: Date | null;
}

/** 対象を選ぶときの候補（課金の状態の表から。名前・アドレスは持たない） */
export interface MemberCandidate {
  userId: string;
  planType: string | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean;
  /** user_subscriptions.created_at（在籍月数の目安） */
  createdAt: Date | null;
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
  /** scheduled_at <= now の文面 */
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

  /** 一意制約つき INSERT（既にあれば何もしない）。新しく入った件数を返す */
  insertDeliveries(rows: NewDelivery[]): Promise<number>;
  listDueDeliveryIds(now: Date, limit: number): Promise<string[]>;
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
