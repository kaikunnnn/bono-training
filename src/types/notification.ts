// 汎用通知システム（#160）の型定義

/**
 * 通知種別。DB の notifications.type CHECK と一致させること。
 * 将来型を追加する場合はこのユニオンと migration の CHECK 制約の両方を更新する。
 */
export type NotificationType =
  | "question_comment"
  | "question_reaction"
  | "comment_reaction";

/** サイト内通知1件（Dropdown 一覧・表示用） */
export interface NotificationItem {
  id: string;
  actorName: string | null;
  actorAvatarUrl: string | null;
  type: NotificationType;
  entityType: string;
  entityId: string;
  linkUrl: string;
  payload: Record<string, unknown> | null;
  /** null = 未読 */
  readAt: string | null;
  createdAt: string;
}
