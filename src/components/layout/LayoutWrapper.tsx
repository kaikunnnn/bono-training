import { Suspense } from "react";
import { cookies } from "next/headers";
import { Bell } from "lucide-react";
import { Layout } from "./Layout";
import { UserProvider } from "./UserProvider";
import { StaleSessionCleaner } from "@/components/auth/StaleSessionCleaner";
import { NotificationBellServer } from "@/components/notifications/NotificationBellServer";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * レイアウトラッパー
 *
 * ユーザー情報の取得をSuspense内のUserProviderに分離し、
 * ページコンテンツの描画をブロックしない。
 * これにより、コンテンツページ（/lessons, /roadmap等）が
 * 静的生成/ISRの候補になる。
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <Suspense fallback={<Layout user={null}>{children}</Layout>}>
      <UserProviderLayout>{children}</UserProviderLayout>
    </Suspense>
  );
}

/** Suspense内でユーザー情報を取得してLayoutに渡す */
async function UserProviderLayout({ children }: { children: React.ReactNode }) {
  const { user, invalidSession } = await UserProvider();

  // 「auth cookie はあるのに認証エラーで無効」= refresh token 失効などの stale cookie。
  // 放置すると getUser のたびに SDK が console.error を吐き、middleware も誤認する
  // （#136 ループの温床）ため、クライアント側で cookie を掃除させる（#137-C）。
  // ネットワーク障害等の一時的失敗（invalidSession=false）では掃除しない
  let hasStaleAuthCookie = false;
  if (!user && invalidSession) {
    const cookieStore = await cookies();
    hasStaleAuthCookie = cookieStore
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  }

  // 通知ベル（#160 S3）: 未読件数の取得を Suspense 境界に閉じ、ページ本体の
  // クリティカルパスから外す。fallback は「バッジなしのベル」で、未読数が確定したら
  // 差し替わる（バッジが付く）。未ログイン時はベル自体を出さない。
  const notificationSlot = user ? (
    <Suspense fallback={<NotificationBellFallback />}>
      <NotificationBellServer userId={user.id} />
    </Suspense>
  ) : null;

  return (
    <Layout user={user} notificationSlot={notificationSlot}>
      {hasStaleAuthCookie && <StaleSessionCleaner />}
      {children}
    </Layout>
  );
}

/**
 * 未読件数取得中に出す「バッジなしのベル」。NotificationBell のトリガーボタンと
 * 見た目を揃える（ghost / h-8 w-8 rounded-full / Bell h-5 w-5）。表示のみ（非活性）。
 */
function NotificationBellFallback() {
  return (
    <div
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground"
      aria-hidden="true"
    >
      <Bell className="h-5 w-5" />
    </div>
  );
}
