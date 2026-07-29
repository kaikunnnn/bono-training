import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getProductionContentSlugs } from "@/lib/productionContentSlugs";

const PRODUCTION_HOST_PATTERN = /^(www\.)?bo-no\.design$/;

/**
 * `/contents/{slug}` の記事が Sanity に存在しない場合の分岐処理。
 *
 * サイト移行: 本番ドメインを Webflow から Next.js（このアプリ）へ向け直すが、
 * まだ全記事が Next.js 側へ移植されていない。そこで:
 *
 * - アクセスされたホストが本番ドメイン（bo-no.design / www.bo-no.design）で、
 *   かつ本番 Webflow の sitemap に該当 slug が存在する
 *   （= 本番にはあるが Next.js 側に未移植）
 *   → Webflow の裏サブドメイン legacy.bo-no.design へ一時リダイレクト（307相当）
 * - それ以外（本番ドメインへの切替前 = ベータドメインでのアクセス、
 *   またはどこにも存在しない slug）
 *   → 従来通り notFound()（自前の 404）
 *
 * ホスト判定が必須な理由: legacy.bo-no.design はまだ実在しないため、
 * ベータドメイン(bono-training.vercel.app 等)でこの分岐に host 条件なしで
 * 到達すると、存在しないドメインへリダイレクトしてしまい、今まで 404 で
 * 済んでいたものが接続エラー表示に悪化する（本番ドメイン切替前の退行）。
 * next.config.ts の fallback rewrite と同じ host 条件をここでも揃える。
 *
 * どちらの分岐も throw するため、戻り値の型は never。
 *
 * 注意: generateMetadata 内で呼んではいけない（redirect() が問題を起こすため）。
 * page 本体 / layout の Server Component 内でのみ使用する。
 */
export async function redirectMissingContent(slug: string): Promise<never> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const isProductionHost = PRODUCTION_HOST_PATTERN.test(host.split(":")[0]);

  if (isProductionHost) {
    const productionSlugs = await getProductionContentSlugs();
    if (productionSlugs.has(slug)) {
      redirect(`https://legacy.bo-no.design/contents/${slug}`);
    }
  }

  notFound();
}
