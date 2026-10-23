/**
 * /dev/design-together/mypage — マイページの複製に「いま作業中」を組み込んだもの（#253 機能A）
 *
 * ログイン不要（本物の getCurrentUser による redirect はしない）。ユーザーはダミーの「あなた」。
 */

import type { Metadata } from "next";
import { ProtoMyPage, type ProtoTabId } from "../_proto/mypage/ProtoMyPage";

export const metadata: Metadata = {
  title: "マイページ（いっしょにデザインのプロト）",
  robots: { index: false, follow: false },
};

const VALID_TABS = new Set<ProtoTabId>(["all", "progress", "favorite", "history"]);

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
