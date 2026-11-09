import { Layout } from "./Layout";
import { MemberPromiseProvider } from "./MemberPromiseProvider";
import { getLayoutMemberState } from "@/lib/services/layout-member-state";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * レイアウトラッパー
 *
 * #277 Phase 3 B 試作（Cache Components / PPR）: 以前はここで会員情報を await してから
 * Layout を描画していたため、cookies() を読む待ち時間が全ページの描画を止めていた。
 *
 * いまは await せず、Promise のまま Layout に渡す。会員依存の部品だけが Suspense の中で
 * それを待つ（MemberPromiseProvider / MemberGate）。children（ページ本文）は Suspense の外に
 * 1回だけ描画するので、仮表示で本文を二重に出さない（H-004）。
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const memberPromise = getLayoutMemberState();
  return (
    <MemberPromiseProvider memberPromise={memberPromise}>
      <Layout>{children}</Layout>
    </MemberPromiseProvider>
  );
}
