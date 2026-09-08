import { notFound } from "next/navigation";

/**
 * /notes/* — 新UIの検討用プレビュー。開発環境と Vercel preview デプロイでのみアクセス可能。
 * Vercel production デプロイでは 404 を返す。
 *
 * 「ものづくりノート」への /guide リブランド案を、本番の /guide を一切変えずに
 * 検討するためのプレビュー。本番採用が決まったら本番ルート（/guide のリネーム等）へ
 * 昇格し、このゲートを外す。不採用なら /notes と dev-preview ごと削除する。
 *
 * 環境別の挙動:
 * - ローカル (npm run dev):       VERCEL_ENV 未定義  → 通る
 * - Vercel preview (PRブランチ):  VERCEL_ENV=preview → 通る
 * - Vercel production (main):     VERCEL_ENV=production → 404
 */
export default function NotesLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
