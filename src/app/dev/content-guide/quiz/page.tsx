import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizProto } from "../QuizProto";

export const metadata: Metadata = {
  title: "スキル診断 B案（クイズ型） プロトタイプ",
  robots: { index: false, follow: false },
};

/**
 * /dev/content-guide/quiz — B案: 1問ずつのクイズ型の診断（#212 プロトタイプ）。
 * 仕様: rebono `02_Projects/15_コンテンツガイド/12_診断UI_A案B案_仕様書.md` §5
 * 認証・DB・Sanity は使わない。状態は URL クエリだけで持ち、保存しない。
 */
export default function ContentGuideQuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-text-muted">読み込み中…</div>}>
      <QuizProto />
    </Suspense>
  );
}
