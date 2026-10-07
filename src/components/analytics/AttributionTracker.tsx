"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureFirstTouch } from "@/lib/first-touch";
import { recordPagePath } from "@/lib/pricing-source";

/**
 * 課金の出どころを測るための全ページ共通トラッカー（rebono issue #233 / D3）。
 *
 * - 初回来訪時に一度だけ「最初に来たページ」を localStorage に記録する（既にあれば上書きしない）
 * - ページを移るたびに「料金ページ・認証ページ以外で最後に表示したパス」を sessionStorage に記録する
 *   （料金ページで有効な from を見たとき、PricingFinal がこれを「ボタンを押したページ」として cookie に写す）
 *
 * RootLayout を Client 化しないための最小の client 境界（WebVitals と同じ形）。何も描画しない。
 * パスは usePathname ではなく location.pathname（%エンコード済み）を使う。
 */
export function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    captureFirstTouch();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    recordPagePath(window.location.pathname);
  }, [pathname]);

  return null;
}
