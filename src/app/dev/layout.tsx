import { notFound } from "next/navigation";

/**
 * /dev/* routes — 開発環境と Vercel preview デプロイでのみアクセス可能。
 * Vercel production デプロイでは 404 を返す。
 *
 * 環境別の挙動:
 * - ローカル (npm run dev):       VERCEL_ENV 未定義  → 通る
 * - Vercel preview (PRブランチ):  VERCEL_ENV=preview → 通る
 * - Vercel production (main):     VERCEL_ENV=production → 404
 *
 * /dev 配下に検討中・棚卸し用の UI が並ぶ。本番ユーザーに見せる意図のないページなので
 * ここでまとめてゲートする。本番でも見せる必要が出たら、対象ページを /dev の外に出すこと。
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
