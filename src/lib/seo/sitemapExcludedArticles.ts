// src/lib/seo/sitemapExcludedArticles.ts — sitemap に載せない記事（#276）
//
// 公開の記事（isPremium:false）は基本すべて sitemap に載せるが、
// 中身がまだ無い「作成中」の仮ページは Google に読ませる意味がないので外す。
// サイトマップには検索に出したい正規URLだけを入れるのが定石:
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
//
// 本文ができて公開するときは、ここから消すだけで sitemap に戻る。

export const SITEMAP_EXCLUDED_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
  // 「製作中：9月中旬までにリリース」本文なし（2026-11-01 確認）
  "sbd-step4-wip",
  // 「作成中」本文約80字（2026-11-01 確認）
  "ai-ui-styling-coming-soon",
]);
