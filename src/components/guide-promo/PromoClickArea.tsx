"use client";

import type { MouseEvent, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import type { PromoTracking } from "./types";

/**
 * 紹介ブロック（#280）の中のリンクが押されたら GA4 `roadmap_promo_click` を送る。
 * 中身は Server Component のまま（ロードマップカード・料金リンクには手を入れない）。
 * 行き先はクリックされた <a> の href から決める（/roadmap → roadmap、/subscription → pricing）。
 * 料金リンクは PricingCtaLink 側でも `pricing_cta_click` が別に送られる。
 */
export function PromoClickArea({
  tracking,
  className,
  children,
}: {
  tracking: PromoTracking;
  className?: string;
  children: ReactNode;
}) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element | null;
    const href = target?.closest?.("a")?.getAttribute("href");
    if (!href) return;
    const destination = href.startsWith("/subscription")
      ? "pricing"
      : href.startsWith("/roadmap")
        ? "roadmap"
        : "other";
    try {
      trackEvent("roadmap_promo_click", {
        placement: tracking.placement,
        destination,
        page_type: tracking.pageType,
        page_slug: tracking.pageSlug ?? "",
        roadmap_slug: tracking.roadmapSlug,
      });
    } catch {
      // GA 失敗で遷移を止めない
    }
  };

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
}
