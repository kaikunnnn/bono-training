import "server-only";
import { getUnreadCount } from "@/lib/services/notifications";
import { NotificationBell } from "./NotificationBell";

interface NotificationBellServerProps {
  userId: string;
}

/**
 * 未読件数の取得（getUnreadCount）を内包した非同期 Server Component（#160 S3）。
 *
 * この Component 自体を <Suspense fallback={バッジなしのベル}> でラップして使うことで、
 * getUnreadCount の1往復をページのクリティカルパス（最初の HTML 返却）から外す。
 * 結果として、ベルがある画面でも TTFB がベル無し時と同等になる。
 */
export async function NotificationBellServer({
  userId,
}: NotificationBellServerProps) {
  const unreadCount = await getUnreadCount(userId);
  return <NotificationBell userId={userId} initialUnreadCount={unreadCount} />;
}
