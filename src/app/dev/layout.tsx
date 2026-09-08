import { assertNotProduction } from "@/lib/dev-gate";

/**
 * /dev/* routes — 開発環境と Vercel preview デプロイでのみアクセス可能。
 * 本番（production デプロイ / 本番ドメイン）では 404 を返す（判定は dev-gate 参照）。
 *
 * /dev 配下に検討中・棚卸し用の UI が並ぶ。本番ユーザーに見せる意図のないページなので
 * ここでまとめてゲートする。本番でも見せる必要が出たら、対象ページを /dev の外に出すこと。
 */
export default async function DevLayout({ children }: { children: React.ReactNode }) {
  await assertNotProduction();
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
