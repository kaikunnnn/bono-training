/**
 * Slack を課金メンバーだけに保つ定期整理（#263）の共通型。純粋な型のみ（どこからでも import 可）。
 *
 * 保存しない: 名前・メール・プロフィール・DM本文・トークン（使い捨てリンクの値はハッシュだけ）。
 * 名前は扱わない（オーナー報告DMは <@U…> のメンションで Slack に名前を出してもらう）。
 */

export type SyncMode = "off" | "dry_run" | "test" | "live";

export interface SyncSettings {
  mode: SyncMode;
  /** test モードで DM を送ってよい Slack ユーザーID */
  testUserIds: string[];
  /**
   * つなぐお願いDMを送ってから、つながらなければ外す候補にするまでの日数（既定 7。2026-10-29 に 14 → 7）。
   * ※ 設定行の min_notice_days 列は、外れるお知らせDMの廃止（2026-10-29）で使わなくなった（本番に列だけ残る）
   */
  linkGraceDays: number;
  /** オーナーへの報告DMを最後に送った日（JST, YYYY-MM-DD）。同じ日に二度送らない */
  ownerReportSentOn: string | null;
  /**
   * 手で「残す」と決めた BONO ユーザーID。課金の定義（live かつ stripe_subscription_id）に入らないが
   * 実際は払っている人（旧 Memberstack・同期ズレ等）用。つなぐページ・マイページでも課金中として扱う
   */
  keepUserIds: string[];
  /** 手で「残す」と決めた Slack ユーザーID */
  keepSlackUserIds: string[];
  /** test モードでマイページの「Slackとつなぐ」カードを見せる BONO ユーザーID */
  testBonoUserIds: string[];
}

/** 判定 */
export type Classification = "keep" | "remove_scheduled" | "needs_link" | "excluded" | "resolved";

export type ExcludedReason =
  | "bot"
  | "deleted"
  | "guest"
  | "invited"
  | "other_team"
  | "primary_owner"
  | "owner"
  | "admin";

/**
 * - cancel_reserved: 課金中だが解約予約あり（期間の終わりの翌日に外す。DM なし）
 * - canceled: 課金が終わっている（すぐ外す。DM なし）
 * - link_expired: つなぐお願いDMの期限までに、課金中のBONOアカウントとつながらなかった
 */
export type ScheduledReason = "cancel_reserved" | "canceled" | "link_expired";

/**
 * - not_linked: BONO にメールが一致するアカウントがない（つながっていない）
 * - no_paid_record: BONO アカウントはあるが、課金（live かつ stripe_subscription_id あり）の記録がない
 */
export type NeedsLinkReason = "not_linked" | "no_paid_record";

/** - deactivated: Slack で外された（削除済み）を確認した / resubscribed・linked: 外す予定が取り消された */
export type ResolvedReason = "deactivated" | "resubscribed" | "linked";

/** メンバーに送る DM の種類。外れるお知らせDM（removal_notice）は 2026-10-29 に廃止 */
export type DmType = "link_request";

export type LinkedVia = "email" | "dm_link" | "mypage";

/** users.list の1人分から、判定とオーナー報告に使う列だけ */
export interface SlackMemberSummary {
  id: string;
  teamId: string | null;
  deleted: boolean;
  isBot: boolean;
  isAppUser: boolean;
  isWorkflowBot: boolean;
  isInvitedUser: boolean;
  isRestricted: boolean;
  isUltraRestricted: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isPrimaryOwner: boolean;
  /** md5(lower(trim(email)))。メールが取れない（スコープ不足・ボット等）なら null。メールそのものは持たない */
  emailHash: string | null;
}

/**
 * BONO ユーザーの課金の要約（その人の最新の live 行）。
 * 課金の数え方: environment='live' かつ stripe_subscription_id があるものだけ。
 */
export interface SubscriptionSummary {
  userId: string;
  /** live かつ stripe_subscription_id のある行があるか（=課金の記録がある） */
  hasPaidRecord: boolean;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  cancelAt: Date | null;
  currentPeriodEnd: Date | null;
}

/** Slack メンバーと BONO ユーザーの対応（つながり or メール一致） */
export interface MemberMatch {
  via: "link" | "email";
  subscription: SubscriptionSummary;
}

/** slack_member_sync_state の1行（保存してよい列だけ） */
export interface SyncState {
  teamId: string;
  slackUserId: string;
  classification: Classification;
  /** ExcludedReason / ScheduledReason / NeedsLinkReason / null */
  reason: string | null;
  /** 外す日（JST の日付 YYYY-MM-DD）。解約は判定した時点、link_expired は期限切れの時点で決まる */
  removeAfter: string | null;
  /** つなぐお願いの期限（JST の日付。この日まではつながるのを待つ） */
  linkDeadline: string | null;
  linkRequestDmAt: Date | null;
  linkRequestVersion: number | null;
  /** 外れるお知らせDMの廃止（2026-10-29）で使わなくなった列。本番に残っているので読み書きの型だけ残す */
  removalNoticeDmAt: Date | null;
  /** 同上（未使用） */
  removalNoticeVersion: number | null;
  dryRunResult: string | null;
  dryRunAt: Date | null;
  needsReview: boolean;
  /** 例: sending:link_request / send_unknown:timeout / dm_failed:cannot_dm_user / message_not_approved */
  reviewReason: string | null;
  resolvedAt: Date | null;
  resolvedReason: ResolvedReason | null;
  firstSeenAt: Date;
}

/**
 * 永続化層。失敗時は例外を投げる（cron 側で 500 / ログに変換する）。
 * 実装: Supabase（store.ts）、テスト用のインメモリ実装。
 */
export interface SyncStore {
  getSettings(): Promise<SyncSettings | null>;
  /** 同時に2つの cron が走らないよう、設定行で実行ロックを取る。取れたら true */
  acquireRunLock(now: Date, until: Date): Promise<boolean>;
  releaseRunLock(): Promise<void>;
  /** メールのハッシュ / ユーザーID から、BONO ユーザーと課金の要約を引く（SQL 関数） */
  lookupSubscriptions(
    emailHashes: string[],
    userIds: string[],
  ): Promise<{ emailHash: string | null; subscription: SubscriptionSummary }[]>;
  listLinks(teamId: string): Promise<{ userId: string; slackUserId: string }[]>;
  /** 一意制約付き INSERT。既にどちらかがつながっていれば "conflict" */
  insertLink(link: {
    userId: string;
    teamId: string;
    slackUserId: string;
    linkedVia: LinkedVia;
  }): Promise<"inserted" | "conflict">;
  listStates(teamId: string): Promise<SyncState[]>;
  upsertStates(states: SyncState[]): Promise<void>;
  /**
   * DM を送る直前の確保。needs_review が立っておらず（本文未承認の印は除く）、
   * その DM の送信日時が空のときだけ needs_review=true / review_reason=sending:<type> にする。確保できたら true
   */
  claimDm(teamId: string, slackUserId: string, dmType: DmType): Promise<boolean>;
  /** 状態行の一部を書き換える（DM の結果の記録など） */
  patchState(teamId: string, slackUserId: string, patch: Partial<SyncState>): Promise<void>;
  /** 使い捨てリンクのハッシュを保存する */
  insertLinkToken(token: {
    tokenHash: string;
    teamId: string;
    slackUserId: string | null;
    purpose: "link_request" | "mypage";
    expiresAt: Date;
    requestedByUserId: string | null;
  }): Promise<void>;
  markOwnerReportSent(date: string): Promise<void>;
}

/** slack_member_link_claim の戻り値 */
export type LinkClaimResult =
  | "linked"
  | "already_linked"
  | "invalid"
  | "used"
  | "expired"
  | "slack_linked_to_other"
  | "user_linked_to_other"
  | "conflict";

/** つなぐページ（/slack/link）・マイページのカードが使う永続化 */
export interface LinkStore {
  getSettings(): Promise<SyncSettings | null>;
  /** 使い捨てリンクの状態を見る（無効化はしない） */
  peekToken(tokenHash: string): Promise<"valid" | "invalid" | "used" | "expired">;
  /** 使い捨てリンクでつなぐ（SQL 関数で1トランザクション） */
  claimLink(tokenHash: string, userId: string): Promise<LinkClaimResult>;
  /** その BONO ユーザーのつながり。なければ null */
  getLinkByUserId(userId: string): Promise<{ teamId: string; slackUserId: string } | null>;
  /** その Slack ユーザーがつながっている BONO ユーザー。なければ null */
  getLinkedUserId(teamId: string, slackUserId: string): Promise<string | null>;
  /** その BONO ユーザーの課金の要約（最新の live 行）。BONO ユーザーがいなければ null */
  getSubscription(userId: string): Promise<SubscriptionSummary | null>;
  /** マイページからの申し込み回数（since 以降） */
  countMypageRequests(userId: string, since: Date): Promise<number>;
  insertLinkToken: SyncStore["insertLinkToken"];
}
