/**
 * 活動ログ（#213 A1）のクライアント側ヘルパー。Client Component からのみ使う。
 *
 * - logActivity: Server Action を fire-and-forget で呼ぶ（await しない・失敗しても無視）
 * - Supabase の auth cookie が無い（=確実に未ログイン）ときは Server Action を呼ばない
 *   （匿名の閲覧ごとに無駄な POST を飛ばさないため。最終判定はサーバー側）
 * - trackPricingCtaClick: 料金ページへの CTA クリックを GA4 と活動ログの両方に送る
 *   （未ログインは活動ログが no-op になるため GA4 側で数える）
 */
import { recordActivity } from "@/lib/services/activity";
import { trackEvent } from "@/lib/analytics";
import {
  isPricingCtaSourceGroup,
  type PricingCtaSourceGroup,
  type RecordActivityInput,
} from "@/lib/activity-utils";

/** @supabase/ssr の auth cookie（sb-<ref>-auth-token / 分割時は .0 .1 ...）があるか */
export function hasSupabaseAuthCookie(): boolean {
  try {
    return /(?:^|;\s*)sb-[^=;]+-auth-token/.test(document.cookie);
  } catch {
    // 読めない環境では判定をサーバーに任せる
    return true;
  }
}

export function logActivity(input: RecordActivityInput): void {
  if (typeof window === "undefined") return;
  if (!hasSupabaseAuthCookie()) return;
  try {
    recordActivity({
      path: window.location.pathname,
      ...input,
    }).catch(() => {
      // Server Action 側でログ済み。体験は止めない
    });
  } catch {
    // 同上
  }
}

export function trackPricingCtaClick(group: PricingCtaSourceGroup): void {
  const sourceGroup: PricingCtaSourceGroup = isPricingCtaSourceGroup(group)
    ? group
    : "other";
  try {
    trackEvent("pricing_cta_click", { source_group: sourceGroup });
  } catch {
    // GA 失敗で遷移を止めない
  }
  logActivity({
    eventType: "pricing_cta_click",
    meta: { source_group: sourceGroup },
  });
}

export function trackSuccessNextClick(destination: string): void {
  logActivity({
    eventType: "success_next_click",
    meta: { destination },
  });
}

/**
 * Slack コミュニティ参加（招待リンク）クリック。
 * 招待URL自体はトークンを含むため meta には入れず、置き場所のラベルだけ残す。
 */
export function trackCommunityJoinClick(placement: string): void {
  logActivity({
    eventType: "community_join_click",
    meta: { placement },
  });
}
