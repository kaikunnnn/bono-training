"use client";

import { HomeClickLink } from "@/components/analytics/HomeClickLink";

export function ViewAllButton({ tab, section }: { tab: string; section: string }) {
  const href = tab === "all" ? "/mypage" : `/mypage?tab=${tab}`;

  return (
    <HomeClickLink
      href={href}
      intentPrefetch
      tracking={{ surface: "mypage", section, itemType: "view_all", contentId: tab }}
      scroll={false}
      className="text-xs font-medium cursor-pointer text-slate-950/65 transition-colors hover:text-blue-600"
    >
      すべてみる
    </HomeClickLink>
  );
}
