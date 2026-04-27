"use client";

/**
 * Google Analytics 4 - ページビュー追跡
 *
 * Next.js App Router では usePathname でルート変更を検知して
 * GA4 にページビューを送信する
 *
 * useSearchParams は Suspense バウンダリが必要なため
 * GoogleAnalytics でラップして使用する
 */

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <PageTracker />
    </Suspense>
  );
}
