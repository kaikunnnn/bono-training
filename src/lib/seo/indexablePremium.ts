// src/lib/seo/indexablePremium.ts — 会員限定記事のうち、検索に戻す記事（#236 / rebono#18 パイロット10本 + #276 残り27本）
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
  // #276（2026-11-01 オーナー「戻して」）: 43本の残り27本。genta は本文が薄いので対象外のまま
  // （#236 の決定どおり。ストーリー側も対象外）。無料範囲はパイロットと同じ自動計算。
  { slug: "goaldirect-2-1" },
  { slug: "bono-session03" },
  { slug: "ui-architect-beginner-63" },
  { slug: "figma-prototyping-animation-overlay" },
  { slug: "three-structures-22" },
  { slug: "material-design-selectui-01" },
  { slug: "ui-idea-11" },
  { slug: "bono-ui-refelence" },
  { slug: "ooui-11" },
  { slug: "uinavi04" },
  { slug: "material-design-navigation-bar" },
  { slug: "materialdesign-rindoku-04" },
  { slug: "tutorial-uivisual-09" },
  { slug: "ui-layout-basic04-7" },
  { slug: "ooui-09" },
  { slug: "uivisual-6-2" },
  { slug: "ooui-10" },
  { slug: "ui-pattern-10" },
  { slug: "bannerbeginner-03-1" },
  { slug: "uivisual-6-6" },
  { slug: "ux-beginner15" },
  { slug: "gu-ke-zhong-xin-dezain-0-jia-zhi-ding-yi-nituite" },
  { slug: "materialdesign-spacingmethod" },
  { slug: "sore-jie-keru-ke-ti-ninatuteru-dezainke-neng-na-ke-ti-wojian-fen-kerufang-fa" },
  { slug: "tutorial-uivisual-07-02" },
  { slug: "ui-architect-beginner-67" },
  { slug: "ui-pattern-12" },
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

// ---------------------------------------------------------------------------
// 会員限定ストーリー（/stories/<slug>）のうち、検索に戻すもの（rebono#18 残り分）
//
// 対象5本は同じ slug の article（/contents/<slug>、レッスン内の記事）と本文が同じ。
// 正規ページは /stories/<slug>。/contents/<slug> はレッスン導線（進捗・前後移動）に使うので
// リダイレクトせず、canonical だけ /stories/<slug> に向ける（storyCanonicalForContent）。
// 追加前に story と article の本文を照合すること。
// ---------------------------------------------------------------------------

export const INDEXABLE_PREMIUM_STORIES: readonly IndexablePremiumArticle[] = [
  { slug: "youhadouyatedezainanishooochn" },
  { slug: "youhadouyatedezainanihanzo" },
  { slug: "youhadouyatedezainaniyudai" },
  { slug: "howtobedesigner-mone" },
  { slug: "youhadouyatedesigner-yifan-01" },
];

const STORY_ENTRY_BY_SLUG = new Map(
  INDEXABLE_PREMIUM_STORIES.map((entry) => [entry.slug, entry]),
);

export function isIndexablePremiumStorySlug(slug: string): boolean {
  return STORY_ENTRY_BY_SLUG.has(slug);
}

/** 同じ本文の /stories/<slug> が正規ページになる /contents/<slug> の canonical（対象外は null） */
export function storyCanonicalForContent(slug: string): string | null {
  return STORY_ENTRY_BY_SLUG.has(slug)
    ? `https://www.bo-no.design/stories/${slug}`
    : null;
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

/** ストーリーの slug と本文から、非会員に見せるブロック数を返す（対象外は undefined） */
export function freeBlockCountForIndexablePremiumStory(
  slug: string,
  content: readonly (FreeRangeBlock | null | undefined)[] | null | undefined,
): number | undefined {
  const entry = STORY_ENTRY_BY_SLUG.get(slug);
  if (!entry) return undefined;
  return computeFreeBlockCount(content, entry.freeBlockCount);
}
