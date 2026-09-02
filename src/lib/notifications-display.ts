// 汎用通知システム（#160 S2）：通知の表示用ヘルパー（純粋関数・client-safe）
//
// - 文言組み立て（type ごとの switch）と相対時刻表示をまとめる。
// - サーバー依存（DB/cookies）は一切持たないため Client Component から直接 import 可。
// - 将来 type を追加する場合は buildNotificationMessage の switch にケースを足すだけでよい。

import type { NotificationItem, NotificationType } from "@/types/notification";

/** actorName が無い場合の表示名フォールバック */
const FALLBACK_ACTOR_NAME = "メンバー";

/**
 * 通知の本文を type に応じて組み立てる。
 * 将来 type を追加したら case を足すこと（default は汎用文言でクラッシュさせない）。
 */
export function buildNotificationMessage(item: NotificationItem): string {
  const actor = item.actorName?.trim() || FALLBACK_ACTOR_NAME;
  switch (item.type as NotificationType) {
    case "question_comment":
      return `${actor}さんがコメントしました`;
    case "question_reaction":
      return `${actor}さんが質問にリアクションしました`;
    case "comment_reaction":
      return `${actor}さんがコメントにリアクションしました`;
    default:
      // 未知の type でも「通知が届いた」ことは伝える（拡張時の安全側フォールバック）
      return `${actor}さんからの新しい通知`;
  }
}

/**
 * 相対時刻を日本語で返す簡易実装（新規ライブラリは追加しない方針）。
 * - 1分未満: たった今
 * - 60分未満: n分前
 * - 24時間未満: n時間前
 * - 7日未満: n日前
 * - それ以上: M月D日
 * 不正な日付は空文字を返す（表示を壊さない）。
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  // 未来日時（時計ずれ等）は「たった今」に丸める
  if (diffMs < 0) return "たった今";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;

  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 未読バッジの表示テキスト（0 は呼び出し側で非表示にする前提。9件超は "9+"） */
export function formatUnreadBadge(count: number): string {
  if (count > 9) return "9+";
  return String(count);
}
