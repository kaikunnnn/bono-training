"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getLayoutMemberState,
  type LayoutMemberState,
} from "@/lib/services/layout-member-state";
import { StaleSessionCleaner } from "@/components/auth/StaleSessionCleaner";
import { MemberStatusRecorder } from "@/components/analytics/MemberStatusRecorder";
import { SiteVisitRecorder } from "@/components/analytics/SiteVisitRecorder";

/**
 * #277 Phase 3 A1 試作: 共通の枠で使う会員情報をブラウザ側で読む。
 *
 * - サーバーが返す HTML（作り置き）には会員情報を一切入れない。最初の描画は必ず "loading"
 *   （サーバーとブラウザの最初の描画を一致させ、hydration のずれを起こさない）
 * - auth cookie が無ければ、通信せずに "anonymous" に確定する（ロボット・未ログインは関数を動かさない）
 * - auth cookie があれば Server Action（getLayoutMemberState）を1回だけ呼ぶ
 * - ページを移動するたびに auth cookie の中身を見比べ、変わったとき（ログイン・ログアウト・
 *   トークン更新）だけ取り直す。変わっていなければ通信しない
 */
export type LayoutMember =
  | { status: "loading"; user: undefined; unreadCount: 0; boardUnseen: false }
  | ({ status: "ready" } & LayoutMemberState);

const LOADING: LayoutMember = { status: "loading", user: undefined, unreadCount: 0, boardUnseen: false };
const ANONYMOUS: Extract<LayoutMember, { status: "ready" }> = {
  status: "ready",
  user: null,
  invalidSession: false,
  memberStatus: "anonymous",
  unreadCount: 0,
  boardUnseen: false,
};

const LayoutMemberContext = createContext<LayoutMember>(LOADING);

export function useLayoutMember(): LayoutMember {
  return useContext(LayoutMemberContext);
}

/** Supabase の auth cookie（sb-<ref>-auth-token と分割された .0/.1）を並べた文字列。無ければ "" */
function readAuthCookieSignature(): string {
  return document.cookie
    .split("; ")
    .filter((c) => {
      const name = c.split("=")[0];
      return name.startsWith("sb-") && name.includes("-auth-token");
    })
    .sort()
    .join("; ");
}

export function ClientUserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [member, setMember] = useState<LayoutMember>(LOADING);
  const signatureRef = useRef<string | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const signature = readAuthCookieSignature();
    if (signature === signatureRef.current) return;
    signatureRef.current = signature;

    if (!signature) {
      // 通信はしない。他の取得結果と同じく非同期で反映する（effect 内の同期 setState を避ける）
      const requestId = ++requestRef.current;
      void Promise.resolve().then(() => {
        if (requestId === requestRef.current) setMember(ANONYMOUS);
      });
      return;
    }

    const requestId = ++requestRef.current;
    getLayoutMemberState()
      .then((state) => {
        if (requestId === requestRef.current) setMember({ status: "ready", ...state });
      })
      .catch(() => {
        // 一時的な失敗: 未ログイン表示にするが、GA には誤った値を送らない
        if (requestId === requestRef.current) setMember({ ...ANONYMOUS, memberStatus: null });
      });
  }, [pathname]);

  const isReady = member.status === "ready";
  return (
    <LayoutMemberContext.Provider value={member}>
      {isReady && !member.user && member.invalidSession && <StaleSessionCleaner />}
      {isReady && member.memberStatus && <MemberStatusRecorder status={member.memberStatus} />}
      {isReady && member.user && <SiteVisitRecorder userId={member.user.id} />}
      {children}
    </LayoutMemberContext.Provider>
  );
}
