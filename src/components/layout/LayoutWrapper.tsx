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
 * ユーザー情報を取得して Layout に渡す。
 *
 * 以前は user 取得を Suspense 内に分離し、fallback にも `children` を描画して
 * いたが、fallback と解決後の両方が `children` を含むため、SSR の HTML に
 * ページ全体が2回出力されていた（h1 が2つ・HTMLサイズ約2倍）。
 * PPR は無効で UserProvider は cookies() を使うため、対象ページは元々すべて
 * 動的レンダリング（静的生成の候補ではない）。Suspense による静的化メリットは
 * 実際には無かったため、Suspense を外して user を直接 await し、`children` を
 * 1回だけ描画する。認証挙動（UserProvider / StaleSessionCleaner / user prop）は
 * 従来どおり。
 */
export async function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, invalidSession } = await UserProvider();

  // 「auth cookie はあるのに認証エラーで無効」= refresh token 失効などの stale cookie。
  // 放置すると getUser のたびに SDK が console.error を吐き、middleware も誤認する
  // （#136 ループの温床）ため、クライアント側で cookie を掃除させる（#137-C）。
  // ネットワーク障害等の一時的失敗（invalidSession=false）では掃除しない。
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
