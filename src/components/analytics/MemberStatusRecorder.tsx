"use client";

import { useEffect } from "react";
import { setEventDefaults, setUserProperties } from "@/lib/analytics";
import {
  MEMBER_STATUS_EVENT_PARAM,
  MEMBER_STATUS_PROPERTY,
  readLastPayingAt,
  rememberPayingNow,
  resolveMemberStatusAtEvent,
  type MemberStatus,
} from "@/lib/analytics/member-status";

/**
 * GA4 の会員状態を設定する。
 * - ユーザープロパティ member_status（paying / free / anonymous、#213 T4。10/9からの系列なので維持）
 * - イベントパラメータ member_status_at_event（上記＋anonymous_member、#266 S1）
 *
 * LayoutWrapper で `{children}` より前に無条件で描画する。React は同じコミット内の
 * 兄弟の effect をツリー順に実行するため、ページ側の effect（料金ページの view_plans 等）
 * より先に設定される。ログイン/ログアウト/購入で status が変わると
 * レイアウトの再描画で再設定される。
 *
 * 初回の page_view は GA_BOOTSTRAP の config で送られ、この effect より後に gtag が
 * 用意されることがあるため、隠し要素 data-ga-member-status を描画して
 * GA_BOOTSTRAP が config の前に読み取り set する（config.ts）。
 *
 * 値はサーバーで deriveMemberStatus により算出済みのものを props で受け取る
 * （クライアントから追加の DB/API 呼び出しはしない）。
 * 開発/プレビュー環境では setUserProperties / setEventDefaults 内の isGAEnabled で何もしない
 * （paying の印の localStorage 書き込みだけは行う）。
 */
export function MemberStatusRecorder({ status }: { status: MemberStatus }) {
  useEffect(() => {
    if (status === "paying") rememberPayingNow();
    const atEvent = resolveMemberStatusAtEvent(status, readLastPayingAt(), Date.now());
    setUserProperties({ [MEMBER_STATUS_PROPERTY]: status });
    setEventDefaults({ [MEMBER_STATUS_EVENT_PARAM]: atEvent });
  }, [status]);

  return <span hidden data-ga-member-status={status} />;
}
