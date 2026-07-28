import "server-only";
import { notFound, redirect } from "next/navigation";
import { getProductionContentSlugs } from "@/lib/productionContentSlugs";

/**
 * `/contents/{slug}` の記事が Sanity に存在しない場合の分岐処理。
 *
 * サイト移行: 本番ドメインを Webflow から Next.js（このアプリ）へ向け直すが、
 * まだ全記事が Next.js 側へ移植されていない。そこで:
 *
 * - 本番 Webflow の sitemap に該当 slug が存在する
 *   （= 本番にはあるが Next.js 側に未移植）
 *   → Webflow の裏サブドメイン legacy.bo-no.design へ一時リダイレクト（307相当）
 * - sitemap にも存在しない（= どこにも無い）
 *   → 従来通り notFound()（自前の 404）
 *
 * どちらの分岐も throw するため、戻り値の型は never。
 *
 * 注意: generateMetadata 内で呼んではいけない（redirect() が問題を起こすため）。
 * page 本体 / layout の Server Component 内でのみ使用する。
 */
export async function redirectMissingContent(slug: string): Promise<never> {
  const productionSlugs = await getProductionContentSlugs();

  if (productionSlugs.has(slug)) {
    redirect(`https://legacy.bo-no.design/contents/${slug}`);
  }

  notFound();
}
