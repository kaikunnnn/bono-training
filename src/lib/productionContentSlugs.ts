import "server-only";

/**
 * Webflow 本番サイト（www.bo-no.design）の sitemap.xml から
 * `/contents/{slug}` のスラッグ一覧を取得する。
 *
 * 目的（サイト移行 Week1 / SEO止血）:
 * Next.js ベータ（このアプリ）と Webflow 本番が同一 slug の記事で
 * Google 検索上で競合している。ベータ側の同一記事に対しては
 * cross-domain canonical を本番 URL に向け、sitemap からも除外することで
 * 本番の SEO 評価を守る。
 *
 * 静的リストを持たず、本番 sitemap を都度 fetch して動的判定することで、
 * 今後記事が本番へ順次移植されても自動追従する。
 *
 * フェイルセーフ: fetch/パースに失敗した場合は空 Set を返す。
 * これにより「重複なし」＝自己 canonical のまま（安全側）に倒れる。
 * 失敗は console.error でログを残し、黙殺しない。
 */

const PRODUCTION_SITEMAP_URL = "https://www.bo-no.design/sitemap.xml";
const CONTENTS_LOC_REGEX =
  /<loc>\s*https:\/\/www\.bo-no\.design\/contents\/([^<\s]+?)\s*<\/loc>/g;

export async function getProductionContentSlugs(): Promise<Set<string>> {
  try {
    const res = await fetch(PRODUCTION_SITEMAP_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        `[productionContentSlugs] sitemap fetch failed: ${res.status} ${res.statusText}`
      );
      return new Set<string>();
    }

    const xml = await res.text();
    const slugs = new Set<string>();

    for (const match of xml.matchAll(CONTENTS_LOC_REGEX)) {
      const slug = match[1];
      if (slug) {
        slugs.add(slug);
      }
    }

    return slugs;
  } catch (error) {
    console.error(
      "[productionContentSlugs] failed to fetch/parse production sitemap:",
      error
    );
    return new Set<string>();
  }
}
