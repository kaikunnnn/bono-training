/**
 * 掲示板コメント投稿完了トーストの文言（#158）。
 *
 * 純粋関数・client-safe（サーバー依存なし）。投稿成功のたびにランダムで1つ表示する。
 * 文言を増やす場合はこの配列に足すだけでよい。
 */
export const COMMENT_POSTED_TOAST_MESSAGES = [
  "ナイスコメント 👍",
  "こうしてまた世界が平和になった 🌍",
  "デザインの奥地へ一歩前進 🧭",
];

/** コメント投稿完了トーストの文言をランダムに1つ返す。 */
export function getRandomCommentPostedMessage(): string {
  const index = Math.floor(Math.random() * COMMENT_POSTED_TOAST_MESSAGES.length);
  return COMMENT_POSTED_TOAST_MESSAGES[index];
}
