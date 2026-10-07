"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { trackHomeClick } from "@/lib/activity-client";
import type { HomeClickTracking } from "@/lib/activity-utils";

type HomeClickLinkProps = ComponentProps<typeof Link> & {
  /** 何をどこで押したか（#232 home_click） */
  tracking: HomeClickTracking;
  /** true なら IntentPrefetchLink（hover/focus 時だけ prefetch）で描画する */
  intentPrefetch?: boolean;
};

/**
 * /top・マイページのリンク。クリック時に GA4 `home_click` と活動ログを送る。
 * 描画するのは元の Link / IntentPrefetchLink と同じ <a> 1つだけ（見た目・DOMは変えない）。
 * 外側の Server Component はそのまま、葉のリンクだけをこれに差し替えて使う。
 */
export function HomeClickLink({
  tracking,
  intentPrefetch = false,
  onClick,
  ...props
}: HomeClickLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackHomeClick(tracking);
    onClick?.(event);
  };

  if (intentPrefetch) {
    const { prefetch: _ignored, ...rest } = props;
    void _ignored;
    return <IntentPrefetchLink {...rest} onClick={handleClick} />;
  }
  return <Link {...props} onClick={handleClick} />;
}
