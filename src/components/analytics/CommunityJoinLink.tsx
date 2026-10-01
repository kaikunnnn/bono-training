"use client";

import type { ComponentProps, MouseEvent } from "react";
import { trackCommunityJoinClick } from "@/lib/activity-client";

type CommunityJoinLinkProps = ComponentProps<"a"> & {
  /** どこに置かれたボタン/リンクか（meta.placement に記録） */
  placement: string;
};

/**
 * Slack コミュニティの招待リンク（外部）。クリックで活動ログ community_join_click を記録する。
 * 見た目は呼び出し側の className / Button asChild のまま。
 */
export function CommunityJoinLink({
  placement,
  onClick,
  ...props
}: CommunityJoinLinkProps) {
  return (
    <a
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        trackCommunityJoinClick(placement);
        onClick?.(event);
      }}
    />
  );
}
