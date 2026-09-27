"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportWebVitalsMetric } from "@/lib/analytics/web-vitals";

/**
 * 実ユーザーのWeb Vitalsを既存の本番GA4ストリームへ送るだけの境界。
 *
 * `useReportWebVitals` は `"use client"` を要求するので、RootLayoutをClient化せず
 * この最小コンポーネントだけをclient境界にする（Next.js同梱ガイドの推奨形）。
 * callbackはモジュールスコープの関数参照をそのまま渡し、再レンダリングで
 * onCLS/onLCP等の登録が増えないようにする。
 */
export function WebVitals() {
  useReportWebVitals(reportWebVitalsMetric);
  return null;
}
