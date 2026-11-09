"use server";

import { getCachedAuth } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { deriveMemberStatus, type MemberStatus } from "@/lib/analytics/member-status";
import { getUnreadCount } from "@/lib/services/notifications";
import { hasUnseenBoard } from "@/lib/services/board-views";

/**
 * #277 Phase 3 A1 試作: 共通の枠（サイドバー・通知ベル・掲示板の新着ドット・GA の会員状態）が
 * 使う会員情報を、ブラウザから1回の Server Action でまとめて取る。
 *
 * 以前は LayoutWrapper（全ページ共通の Server Component）が cookies() を読んでこれらを
 * 取っていたため、全ページが毎回サーバー描画（no-store）になっていた。枠から外すことで、
 * 誰が見ても同じページ（/lessons など）は作り置き（ISR）になれる。
 *
 * 呼ぶのは auth cookie を持つブラウザだけ（ClientUserProvider が document.cookie で判定）。
 * 未ログインの閲覧者・ロボットはこの関数を呼ばない＝関数の実行は増えない。
 */
export type LayoutMemberState = {
  user: { id: string; email: string } | null;
  /** auth cookie はあるのに認証エラーで無効（refresh token 失効など）。StaleSessionCleaner 用 */
  invalidSession: boolean;
  /** GA4 member_status。取得に失敗したら null（誤った値を送らない） */
  memberStatus: MemberStatus | null;
  unreadCount: number;
  boardUnseen: boolean;
};

export async function getLayoutMemberState(): Promise<LayoutMemberState> {
  let auth: Awaited<ReturnType<typeof getCachedAuth>>;
  try {
    auth = await getCachedAuth();
  } catch {
    auth = { user: null, invalidSession: false };
  }

  const { user, invalidSession } = auth;
  if (!user) {
    return { user: null, invalidSession, memberStatus: "anonymous", unreadCount: 0, boardUnseen: false };
  }

  const [subscription, unread, board] = await Promise.allSettled([
    getSubscriptionStatus(),
    getUnreadCount(user.id),
    hasUnseenBoard(user.id),
  ]);

  return {
    user: { id: user.id, email: user.email || "" },
    invalidSession: false,
    memberStatus:
      subscription.status === "fulfilled"
        ? deriveMemberStatus({ isLoggedIn: true, isSubscribed: subscription.value.isSubscribed })
        : null,
    unreadCount: unread.status === "fulfilled" ? unread.value : 0,
    boardUnseen: board.status === "fulfilled" ? board.value : false,
  };
}
