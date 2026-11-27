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
  // AIリサーチ入門: 本文がまだ無い・製作中（2026-11-27 公開時）。01-2 は同日に動画と紹介文を入れて検索に出した（#318）
  "ai-research-04-1",
  "ai-research-04-2",
]);

export function isPlaceholderArticleSlug(slug: string): boolean {
  return PLACEHOLDER_ARTICLE_SLUGS.has(slug);
}
