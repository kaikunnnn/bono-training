/**
 * GA4 ユーザープロパティ `member_status`（#213 T4）の値を決める純粋関数。
 *
 * ダッシュボードの「料金ページを見た」ファネルから課金中の会員を除外するために使う。
 * - paying:    有効な有料サブスクあり（user_subscriptions.is_active = true）
 * - free:      ログイン済みだが有効サブスクなし
 * - anonymous: 未ログイン
 *
 * 「有効なサブスク」の判定は料金ページ（PricingFinal）が「既に会員」とみなす
 * `SubscriptionState.isSubscribed`（= is_active）と同じにそろえる。
 * 100%クーポン等で実質無料のサブスクも is_active=true でプレミアム権限が付くため paying 扱い。
 * PII（user_id・メール等）は含めない。
 */
export type MemberStatus = "paying" | "free" | "anonymous";

export const MEMBER_STATUS_PROPERTY = "member_status";

export function deriveMemberStatus(params: {
  isLoggedIn: boolean;
  isSubscribed: boolean;
}): MemberStatus {
  if (!params.isLoggedIn) return "anonymous";
  return params.isSubscribed ? "paying" : "free";
}
