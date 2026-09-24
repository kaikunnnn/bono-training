/** CMS の説明文が空の公開ガイドだけに使う検索結果向けの説明文。 */
const FALLBACK_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "beginner-to-uiux-designer-examples":
    "デザイン未経験からUI/UXデザイナーに転職した4人の事例を紹介。学習の進め方や転職までの道のりを、実例を通して解説します。",
  "become-uiux-designer-beginner-guide":
    "UI/UXデザイナーの仕事内容と、未経験から転職を目指す際に知っておきたいスキル、年収、将来性を解説します。",
  "how-to-find-jobs-for-beginner-designers":
    "未経験からUI/UXデザイナーを目指す人に向けて、転職先の会社の調べ方を解説。学習中から企業を知り、仕事選びに活かす方法を紹介します。",
  "uiux-interview-tips-and-checkpoints":
    "UI/UXデザイナーの転職面接で聞かれやすい質問と評価ポイントを解説。採用側の視点を学習やポートフォリオづくりに活かします。",
};

export function guideSeoDescription(
  slug: string,
  cmsDescription: string | null | undefined,
): string | undefined {
  return cmsDescription?.trim() || FALLBACK_DESCRIPTIONS[slug];
}
