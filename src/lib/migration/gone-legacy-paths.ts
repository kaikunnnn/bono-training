// 旧 Webflow のパスのうち、新サイトに同じ役割のページが無く、検索の流入も無いので
// 410 Gone で「もう無い」と伝えるもの（#276、2026-11-01 オーナー回答）。
//
// 何もしないと next.config.ts の rewrites.fallback で legacy.bo-no.design の旧ページが
// 200 のまま出続ける（title が旧サイト・canonical なし）。
// next.config の redirects では 410 を返せないので、proxy（src/proxy.ts）で返す。
// proxy の matcher にも同じパスを足すこと（matcher は静的な文字列しか書けない）。
//
// 定石: 移す先が無いページは 404/410。関係の薄いページへまとめて飛ばすとソフト404扱いになる。
// https://developers.google.com/search/docs/crawling-indexing/http-network-errors
// https://developers.google.com/search/docs/crawling-indexing/301-redirects
//
// Search Console（2025-06〜2026-10 の16ヶ月）の実績を添える。
export const GONE_LEGACY_PATHS: ReadonlySet<string> = new Set([
  // 旧「コミュニティ」カテゴリ一覧。クリック0・表示 最大4
  "/content/communitykomiyunitei",
  // 旧転職ロードマップの「フェーズ3 デザイナーになろう（ポートフォリオを作成して採用に応募しよう）」の
  // コース一覧。データなし（クリック・表示とも記録なし）
  "/corse/rdmhuezu3-taitoru",
  // 旧サイトのお知らせバー部品のページ。16ヶ月でクリック1・表示44
  "/news/news-bar",
  // 旧タグ「施策アイデア-ドキュメンテーション」。記事0本の空タグ。Search Console に記録なし
  "/designtag/document",
]);

export function isGoneLegacyPath(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return GONE_LEGACY_PATHS.has(normalized);
}
