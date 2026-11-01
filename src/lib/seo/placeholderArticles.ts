// src/lib/seo/placeholderArticles.ts — 中身がまだ無い「作成中」の仮ページ（#276）
//
// 公開の記事（isPremium:false）は基本すべて検索に出すが、仮ページは Google に読ませる意味がないので
// - sitemap に載せない（sitemap には検索に出したい正規URLだけを入れる）
// - noindex を付ける（sitemap から外すだけでは検索から消えない）
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://developers.google.com/search/docs/crawling-indexing/block-indexing
//
// 本文ができて公開するときは、ここから消すだけで sitemap と index に戻る。

export const PLACEHOLDER_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
  // 「製作中：9月中旬までにリリース」本文なし（2026-11-01 確認）
  "sbd-step4-wip",
  // 「作成中」本文約80字（2026-11-01 確認）
  "ai-ui-styling-coming-soon",
]);

export function isPlaceholderArticleSlug(slug: string): boolean {
  return PLACEHOLDER_ARTICLE_SLUGS.has(slug);
}
