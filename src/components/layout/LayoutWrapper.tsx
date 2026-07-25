import { Suspense } from "react";
import { cookies } from "next/headers";
import { Layout } from "./Layout";
import { UserProvider } from "./UserProvider";
import { StaleSessionCleaner } from "@/components/auth/StaleSessionCleaner";

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

  return (
    <Layout user={user}>
      {hasStaleAuthCookie && <StaleSessionCleaner />}
      {children}
    </Layout>
  );
}
