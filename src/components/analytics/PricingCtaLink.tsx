"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { trackPricingCtaClick } from "@/lib/activity-client";
import {
  withPricingFrom,
  type PricingCtaSourceGroup,
} from "@/lib/activity-utils";

type PricingCtaLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** どこから料金ページへ来たか（P1 の9グループ） */
  group: PricingCtaSourceGroup;
  /** 既定は /subscription。クエリ付きでも可（from は追記される） */
  href?: string;
};

/**
 * 料金ページ（/subscription）への Link。
 * クリック時に GA4 `pricing_cta_click`（source_group）と活動ログを送り、
 * href に `?from=<group>` を付ける。見た目は呼び出し側の className / Button asChild のまま。
 */
export function PricingCtaLink({
  group,
  href = "/subscription",
  onClick,
  ...props
}: PricingCtaLinkProps) {
  return (
    <Link
      {...props}
      href={withPricingFrom(href, group)}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        trackPricingCtaClick(group);
        onClick?.(event);
      }}
    />
  );
}
