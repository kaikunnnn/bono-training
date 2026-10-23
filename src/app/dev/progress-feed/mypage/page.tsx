/**
 * /dev/progress-feed/mypage — マイページ中心案（#251 フェーズ2）
 *
 * 本物のマイページ（/mypage）の見た目を複製し、進捗フィードを組み込んだもの。
 * ログイン不要（本物の getCurrentUser による redirect はしない）。ユーザーはダミーの「あなた」。
 */

import type { Metadata } from "next";
import { ProtoMyPage, type ProtoTabId } from "../_proto/mypage/ProtoMyPage";

export const metadata: Metadata = {
  title: "マイページ（進捗フィードのプロト）",
  robots: { index: false, follow: false },
};

const VALID_TABS = new Set<ProtoTabId>(["all", "progress", "feed", "favorite", "history"]);

function parseTab(value: string | string[] | undefined): ProtoTabId {
  const t = typeof value === "string" ? value : "all";
  return VALID_TABS.has(t as ProtoTabId) ? (t as ProtoTabId) : "all";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  return <ProtoMyPage activeTab={parseTab(params.tab)} />;
}
