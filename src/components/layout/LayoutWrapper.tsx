import { Layout } from "./Layout";
import { ClientUserProvider } from "./ClientUserProvider";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * レイアウトラッパー
 *
 * #277 Phase 3 A1 試作: 以前はここで cookies() を読み（UserProvider）、ログイン中は課金状態・
 * 通知の未読数・掲示板の新着も取っていた。そのせいで全ページが毎回サーバー描画（no-store）に
 * なり、`revalidate = 3600` が効いていなかった。
 *
 * いまはここでは cookie を読まない。会員だけの情報（サイドバーのマイページ/設定、通知ベル、
 * 掲示板の新着ドット、GA の member_status、活動ログ、古い cookie の掃除）は
 * ClientUserProvider がブラウザ側で取る。共通の枠の HTML には会員情報が入らないので、
 * 作り置きにしても他の人に会員情報が配られることはない。
 *
 * H-004（仮表示で本文を二重に出さない）: Suspense で children を包まないので、children は1回だけ描画される。
 * ページ自身が cookies() を読む（/contents/[slug]・/mypage など）は、これまでどおり毎回サーバー描画のまま。
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <ClientUserProvider>
      <Layout>{children}</Layout>
    </ClientUserProvider>
  );
}
