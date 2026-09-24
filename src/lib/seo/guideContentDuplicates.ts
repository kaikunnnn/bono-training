/**
 * /guide に同じ記事本文が公開されている /contents のスラッグ。
 *
 * /contents はレッスン内の動画・進捗・前後移動に使われるため、
 * URL をリダイレクトせず、検索上の正規 URL だけ /guide に集約する。
 * 追加前に両ページの公開本文を照合すること。
 */
export const GUIDE_CONTENT_DUPLICATE_SLUGS = new Set([
  "portfolio-01",
  "rdm-howtostart-roadmap",
  "beginner-to-uiux-designer-examples",
  "become-uiux-designer-beginner-guide",
  "how-to-find-jobs-for-beginner-designers",
  "uiux-interview-tips-and-checkpoints",
]);

export function guideCanonicalForContent(slug: string): string | null {
  return GUIDE_CONTENT_DUPLICATE_SLUGS.has(slug)
    ? `https://www.bo-no.design/guide/${slug}`
    : null;
}
