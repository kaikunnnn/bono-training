import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentGuideProto } from "./ContentGuideProto";

export const metadata: Metadata = {
  title: "コンテンツガイド 診断プロトタイプ",
  robots: { index: false, follow: false },
};

/**
 * /dev/content-guide — なりたいスキル状態から、最初に取り掛かるテーマと道筋を出す診断（#212 プロトタイプ）。
 * 仕様: rebono `02_Projects/15_コンテンツガイド/10_プロトタイプ仕様書.md`
 * 認証・DB・Sanity は使わない。状態は URL クエリ（ブラウザ内）だけで持ち、保存しない。
 */
export default function ContentGuidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-text-muted">読み込み中…</div>}>
      <ContentGuideProto />
    </Suspense>
  );
}
