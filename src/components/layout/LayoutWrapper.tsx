import { Suspense } from "react";
import { Layout } from "./Layout";
import { UserProvider } from "./UserProvider";

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
  const user = await UserProvider();
  return <Layout user={user}>{children}</Layout>;
}
