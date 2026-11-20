"use client";

import { createContext, Suspense, use, useContext } from "react";
import type { LayoutMemberState } from "@/lib/services/layout-member-state";

/**
 * #277 Phase 3 B 試作（Cache Components / PPR）: 共通の枠の会員情報は、サーバーで作った
 * Promise をそのまま受け取り、会員依存の部品だけを Suspense の中で use() する。
 *
 * - children（ページ本文）は Suspense の外に置くので、作り置きの殻（static shell）に1回だけ入る（H-004）
 * - 会員依存の部品（サイドバーのマイページ/設定・通知ベル・新着ドット・GA など）は「穴」になり、
 *   リクエストごとにサーバーで描画されて同じ応答の中で流し込まれる
 */
const MemberPromiseContext = createContext<Promise<LayoutMemberState> | null>(null);

export function MemberPromiseProvider({
  memberPromise,
  children,
}: {
  memberPromise: Promise<LayoutMemberState>;
  children: React.ReactNode;
}) {
  return <MemberPromiseContext.Provider value={memberPromise}>{children}</MemberPromiseContext.Provider>;
}

function Resolved({ render }: { render: (member: LayoutMemberState) => React.ReactNode }) {
  const promise = useContext(MemberPromiseContext);
  if (!promise) throw new Error("MemberPromiseProvider is missing");
  return <>{render(use(promise))}</>;
}

/** 会員情報が確定するまで fallback を出し、確定したら render(member) に差し替える */
export function MemberGate({
  fallback,
  children,
}: {
  fallback: React.ReactNode;
  children: (member: LayoutMemberState) => React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <Resolved render={children} />
    </Suspense>
  );
}
