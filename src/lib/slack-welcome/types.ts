/**
 * Slack ウェルカムDM（#238）の共通型。純粋な型のみ（どこからでも import 可）。
 */

export type WelcomeMode = "off" | "dry_run" | "test" | "live";

export interface WelcomeSettings {
  mode: WelcomeMode;
  /** 運用開始時刻。null なら誰も対象にしない */
  enabledFrom: Date | null;
  testUserIds: string[];
}

export type DeliveryStatus =
  | "queued"
  | "processing"
  | "sending"
  | "sent"
  | "skipped"
  | "pending_activation"
  | "retry_wait"
  | "needs_review"
  | "failed";

/** 処理の確保（claim）ができる状態 */
export const CLAIMABLE_STATUSES: DeliveryStatus[] = [
  "queued",
  "retry_wait",
  "pending_activation",
];

export interface DeliveryRow {
  id: string;
  teamId: string;
  slackUserId: string;
  eventId: string;
  eventTime: Date;
  status: DeliveryStatus;
  attempts: number;
  nextAttemptAt: Date;
  claimToken: string | null;
  lockedUntil: Date | null;
  lastErrorCode: string | null;
  channelId: string | null;
  messageTs: string | null;
  messageVersion: number | null;
  dryRunResult: string | null;
  dryRunAt: Date | null;
  firstReceivedAt: Date;
  sentAt: Date | null;
}

export interface NewDelivery {
  teamId: string;
  slackUserId: string;
  eventId: string;
  eventTime: Date;
  firstReceivedAt: Date;
}

/** claim 済みの行に書き込む差分（保存してよい列だけ） */
export interface DeliveryPatch {
  status?: DeliveryStatus;
  attempts?: number;
  nextAttemptAt?: Date;
  lastErrorCode?: string | null;
  channelId?: string | null;
  messageTs?: string | null;
  messageVersion?: number | null;
  dryRunResult?: string | null;
  dryRunAt?: Date | null;
  sentAt?: Date | null;
  /** true のとき claim_token / locked_until を消す（処理を手放す） */
  release?: boolean;
}

/**
 * 永続化層。失敗時は例外を投げる（呼び出し側で 503 / ログに変換する）。
 * 実装: Supabase（store.ts）、テスト用のインメモリ実装。
 */
export interface WelcomeStore {
  /** 設定行を読む。行が無いときは null */
  getSettings(): Promise<WelcomeSettings | null>;
  /** 一意制約付き INSERT。既にあれば "duplicate" */
  insertDelivery(row: NewDelivery): Promise<"inserted" | "duplicate">;
  /** (team_id, slack_user_id) で行IDを引く */
  findIdByKey(teamId: string, slackUserId: string): Promise<string | null>;
  /**
   * 条件付き UPDATE ... RETURNING で1行を原子的に確保する。
   * 確保できる条件: status が CLAIMABLE_STATUSES で next_attempt_at <= now、
   * または status=processing で locked_until < now（期限切れの確保）。
   * 確保できなければ null。
   */
  claim(id: string, now: Date, lockedUntil: Date, token: string): Promise<DeliveryRow | null>;
  /** claim_token が一致し、status が expectedStatus のときだけ更新する。更新できたら true */
  update(
    id: string,
    token: string,
    expectedStatus: DeliveryStatus,
    patch: DeliveryPatch,
  ): Promise<boolean>;
  /** 拾い直し対象の行IDを古い順に返す */
  listDueIds(now: Date, limit: number): Promise<string[]>;
  /** updated_at が olderThan より古い sending を needs_review にし、件数を返す */
  markStaleSending(olderThan: Date): Promise<number>;
}
