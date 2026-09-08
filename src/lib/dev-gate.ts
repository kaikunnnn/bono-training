import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

/**
 * 本番環境で 404 を返すゲート。/dev・検討中プレビュールートの layout から呼ぶ。
 *
 * VERCEL_ENV はプロジェクト設定「Automatically expose System Environment
 * Variables」がオフだと undefined になり、env 判定だけではゲートが素通りする
 * （実際に 2026-09 の実測で /dev が本番公開されていた）。そのため本番ドメインの
 * ホスト名判定を併用する。headers() を読むためルートは動的レンダリングになるが、
 * 内部確認用ページなので問題ない。
 */
const PRODUCTION_HOSTS = new Set([
  "bono-training.vercel.app",
  "bono-training-kaikunnnns-projects.vercel.app",
  "bono-training-git-main-kaikunnnns-projects.vercel.app",
  "bo-no.design",
  "www.bo-no.design",
  "app.bo-no.design",
]);

export async function assertNotProduction(): Promise<void> {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  if (PRODUCTION_HOSTS.has(host)) {
    notFound();
  }
}
