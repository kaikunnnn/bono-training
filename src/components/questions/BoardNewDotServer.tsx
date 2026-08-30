import "server-only";
import { hasUnseenBoard } from "@/lib/services/board-views";

interface BoardNewDotServerProps {
  userId: string;
}

/**
 * 掲示板の新着（未読）ドットを非同期に解決する Server Component（掲示板の新着ドット）。
 *
 * 通知ベル（NotificationBellServer）と同じ「Suspense スロット方式」。
 * この Component 自体を <Suspense fallback={null}> でラップして SidebarMenuItem の
 * dot スロットに渡すことで、hasUnseenBoard の1往復をレイアウトのクリティカルパスから
 * 外す（未確定時はドット無しで描画 → 確定したらピンクのポチが差し込まれる）。
 *
 * 未読が無い場合は null を返す（ドットを出さない）。
 */
export async function BoardNewDotServer({ userId }: BoardNewDotServerProps) {
  const unseen = await hasUnseenBoard(userId);
  if (!unseen) return null;

  return (
    <span
      className="block h-2 w-2 rounded-full bg-[var(--notification-badge)]"
      role="status"
      aria-label="新着あり"
    />
  );
}
