import { assertNotProduction } from "@/lib/dev-gate";

/**
 * /notes/* — 新UIの検討用プレビュー。開発環境と Vercel preview デプロイでのみアクセス可能。
 * 本番（production デプロイ / 本番ドメイン）では 404 を返す（判定は dev-gate 参照）。
 *
 * 「ものづくりノート」への /guide リブランド案を、本番の /guide を一切変えずに
 * 検討するためのプレビュー。本番採用が決まったら本番ルート（/guide のリネーム等）へ
 * 昇格し、このゲートを外す。不採用なら /notes と dev-preview ごと削除する。
 */
export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  await assertNotProduction();
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
