// src/lib/seo/indexablePremium.ts — 会員限定記事のうち、検索に戻す記事（#236 / rebono#18 パイロット）
//
// Google の正式な有料コンテンツの扱い（flexible sampling + paywalled content 構造化データ）で
// 検索に出す会員限定記事を、ここで1か所管理する。Sanity のデータは書き換えない。
//
// - 対象記事: noindex を外す・sitemap に載せる・Article JSON-LD に isAccessibleForFree:false と hasPart
// - 非会員: 「最初の区切り」まで（computeFreeBlockCount）を見せ、その先はロック
// - 確認済みの Googlebot だけ: 全文を返し、有料部分を .paywalled-content で囲む
//
// 戻すときは配列から消すだけ。本数を増やすときは配列に足すだけ。
// 記事ごとに無料範囲を調整したいときは freeBlockCount を指定する（自動計算より優先）。
//
// 出典:
// https://developers.google.com/search/docs/appearance/structured-data/paywalled-content
// https://developers.google.com/search/docs/appearance/flexible-sampling

export interface IndexablePremiumArticle {
  slug: string;
  /** 非会員に見せる本文ブロック数を手動で決めるとき（省略時は computeFreeBlockCount の自動計算） */
  freeBlockCount?: number;
}

export const INDEXABLE_PREMIUM_ARTICLES: readonly IndexablePremiumArticle[] = [
  { slug: "portfolio-03" },
  { slug: "ui-architect-beginner-65" },
  { slug: "tutorial-uivisual-08" },
  { slug: "material-design-ui-card" },
  { slug: "portfolio-02" },
  { slug: "mian-qiang-hui-uidezain" },
  { slug: "ui-layout-basic03-5" },
  { slug: "ui-layout-basic05-2" },
  { slug: "ui-layout-basic04-4" },
  { slug: "material-design-tabui-01" },
];

const ENTRY_BY_SLUG = new Map(
  INDEXABLE_PREMIUM_ARTICLES.map((entry) => [entry.slug, entry]),
);

export function getIndexablePremiumEntry(
  slug: string,
): IndexablePremiumArticle | undefined {
  return ENTRY_BY_SLUG.get(slug);
}

export function isIndexablePremiumSlug(slug: string): boolean {
  return ENTRY_BY_SLUG.has(slug);
}

/** 有料部分を囲む要素の class（JSON-LD の hasPart.cssSelector と同じ値） */
export const PAYWALLED_CONTENT_CLASS = "paywalled-content";

/** 非会員に見せる最低ブロック数（従来の会員限定プレビューと同じ 3） */
export const FREE_RANGE_MIN_BLOCKS = 3;
/** 非会員に見せる上限（本文ブロック数に対する割合） */
export const FREE_RANGE_MAX_RATIO = 0.3;

interface FreeRangeBlock {
  _type?: string;
  style?: string;
}

function isHeading(block: FreeRangeBlock | null | undefined): boolean {
  return block?._type === "block" && /^h[1-6]$/.test(block.style ?? "");
}

/**
 * 非会員に見せる本文の先頭ブロック数（「最初の区切り」まで）。
 *
 * 1. 3ブロック目以降で最初に出てくる見出しの手前まで
 *    （記事によって節見出しが h2 / h3 / h1 とまちまちなので、レベルは問わない）
 * 2. 見出しが無ければ上限まで
 * 3. 最低 3 ブロック、上限は本文ブロック数の 30%（ただし 3 未満にはしない）
 */
export function computeFreeBlockCount(
  content: readonly (FreeRangeBlock | null | undefined)[] | null | undefined,
  override?: number,
): number {
  const total = content?.length ?? 0;
  if (total === 0) return 0;
  if (typeof override === "number" && override > 0) {
    return Math.min(Math.floor(override), total);
  }

  const max = Math.max(
    FREE_RANGE_MIN_BLOCKS,
    Math.floor(total * FREE_RANGE_MAX_RATIO),
  );

  let cut = total;
  for (let i = FREE_RANGE_MIN_BLOCKS; i < total; i++) {
    if (isHeading(content![i])) {
      cut = i;
      break;
    }
  }

  return Math.min(Math.max(cut, FREE_RANGE_MIN_BLOCKS), max, total);
}

/** 記事の slug と本文から、非会員に見せるブロック数を返す（対象外は undefined） */
export function freeBlockCountForIndexablePremium(
  slug: string,
  content: readonly (FreeRangeBlock | null | undefined)[] | null | undefined,
): number | undefined {
  const entry = getIndexablePremiumEntry(slug);
  if (!entry) return undefined;
  return computeFreeBlockCount(content, entry.freeBlockCount);
}
