"use client";

import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";

export function ViewAllButton({ tab }: { tab: string }) {
  const href = tab === "all" ? "/mypage" : `/mypage?tab=${tab}`;

  return (
    <IntentPrefetchLink
      href={href}
      scroll={false}
      className="text-xs font-medium cursor-pointer text-slate-950/65 transition-colors hover:text-blue-600"
    >
      すべてみる
    </IntentPrefetchLink>
  );
}
