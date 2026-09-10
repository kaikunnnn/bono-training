import { assertNotProduction } from "@/lib/dev-gate";

/**
 * /community/feedback/* — 新UIの検討用プレビュー。開発環境と Vercel preview デプロイでのみアクセス可能。
 * 本番（production デプロイ / 本番ドメイン）では 404 を返す（判定は dev-gate 参照）。
 *
 * フィードバックを /feedbacks から /community/feedback へ移設する案を、本番の /feedbacks を
 * 一切変えずに検討するためのプレビュー。本番採用が決まったら本番ルート（移設 + 旧URLリダイレクト追加）
 * へ昇格し、このゲートを外す。不採用なら /community/feedback と dev-preview ごと削除する。
 */
export default async function CommunityFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertNotProduction();
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
