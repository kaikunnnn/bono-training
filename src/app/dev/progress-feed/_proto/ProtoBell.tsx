"use client";

import { useRouter } from "next/navigation";
import { MockBell } from "../_components/MockBell";
import { MINE_POST_HREF } from "./data";
import { useProto } from "./ProtoProvider";

/**
 * プロト用の通知ベル。
 *
 * 本物のベルは左サイドバー（ログイン中のみ・掲示板の通知）にあり、中身を差し替えられない。
 * 本物と重ねると「どちらが本物か」が分からなくなるため、ページ右上に
 * 同じアイコンのベルを置き、「プロト用の通知」と添えて区別する。
 */
export function ProtoBell() {
  const router = useRouter();
  const { state, dispatch, requestHighlight } = useProto();

  return (
    <div className="fixed right-4 top-16 z-40 flex items-center gap-1.5 rounded-full border border-[var(--card-border-subtle)] bg-surface py-1 pl-3 pr-1 shadow-[var(--shadow-board-card)] lg:top-4">
      <span className="text-[length:var(--text-2xs)] font-bold text-text-muted">プロト用の通知</span>
      <MockBell
        notifications={state.notifications}
        onMarkAllRead={() => dispatch({ type: "markAllRead" })}
        onOpenNotification={(notificationId) => {
          const n = state.notifications.find((x) => x.id === notificationId);
          dispatch({ type: "openNotification", notificationId });
          if (n) requestHighlight(n.postId);
          router.push(MINE_POST_HREF, { scroll: false });
        }}
      />
    </div>
  );
}
