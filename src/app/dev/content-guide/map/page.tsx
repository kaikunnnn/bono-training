import type { Metadata } from "next";
import { Suspense } from "react";
import { MapProto } from "../MapProto";

export const metadata: Metadata = {
  title: "スキルマップ診断 A案 プロトタイプ",
  robots: { index: false, follow: false },
};

/**
 * /dev/content-guide/map — A案: スキルマップ診断（#212 プロトタイプ）。
 * 仕様: rebono `02_Projects/15_コンテンツガイド/12_診断UI_A案B案_仕様書.md` §4
 * 認証・DB・Sanity は使わない。状態は URL クエリだけで持ち、保存しない。
 */
export default function ContentGuideMapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-text-muted">読み込み中…</div>}>
      <MapProto />
    </Suspense>
  );
}
