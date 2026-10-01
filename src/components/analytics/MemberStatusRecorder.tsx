"use client";

import { useEffect } from "react";
import { setUserProperties } from "@/lib/analytics";
import {
  MEMBER_STATUS_PROPERTY,
  type MemberStatus,
} from "@/lib/analytics/member-status";

/**
 * GA4 ユーザープロパティ member_status（paying / free / anonymous）を設定する（#213 T4）。
 *
 * LayoutWrapper で `{children}` より前に無条件で描画する。React は同じコミット内の
 * 兄弟の effect をツリー順に実行するため、ページ側の effect（料金ページの view_plans 等）
 * より先に user_properties が設定される。ログイン/ログアウト/購入で status が変わると
 * レイアウトの再描画で再設定される。
 *
 * 値はサーバーで deriveMemberStatus により算出済みのものを props で受け取る
 * （クライアントから追加の DB/API 呼び出しはしない）。
 * 開発/プレビュー環境では setUserProperties 内の isGAEnabled で何もしない。
 */
export function MemberStatusRecorder({ status }: { status: MemberStatus }) {
  useEffect(() => {
    setUserProperties({ [MEMBER_STATUS_PROPERTY]: status });
  }, [status]);

  return null;
}
