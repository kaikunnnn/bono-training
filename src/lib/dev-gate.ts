import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

/**
 * 本番環境で 404 を返すゲート。/dev・検討中プレビュールートの layout から呼ぶ。
 *
 * ⚠️ 本番遮断の正は src/proxy.ts の DEV_ONLY_PATH_PREFIXES（実測で layout 内の
 * notFound() は 404 にならないため）。これは将来 Next.js 側の挙動が変わった場合の
 * 二重防御として残している。新しい内部用ルートを足すときは proxy 側の
 * DEV_ONLY_PATH_PREFIXES と matcher に必ず追記すること。
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
