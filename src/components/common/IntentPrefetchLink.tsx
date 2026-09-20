"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";

type IntentPrefetchLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

/**
 * 動的なリンク先をviewport内だけで一括prefetchせず、hover/focusしたリンクだけ
 * Next.jsの通常prefetchへ切り替える。タッチ操作はroute loading UIを即時表示する。
 */
export function IntentPrefetchLink(props: IntentPrefetchLinkProps) {
  const [prefetchOnIntent, setPrefetchOnIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={prefetchOnIntent ? null : false}
      onMouseEnter={(event) => {
        setPrefetchOnIntent(true);
        props.onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        setPrefetchOnIntent(true);
        props.onFocus?.(event);
      }}
    />
  );
}
