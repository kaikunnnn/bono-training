// src/lib/seo/articleDescription.ts — 記事（/contents/[slug]）の meta description 生成（#236）
//
// Google は「全ページ同じ型の description」を推奨しておらず、DB 由来のサイトでは
// ページ固有の情報から自動生成することを認めている。
// https://developers.google.com/search/docs/appearance/snippet
//
// 優先順:
//   1. Sanity の excerpt（手書きの要約）
//   2. 本文 Portable Text の冒頭の段落（通常の段落のみ。見出し・リスト・URLだけの行は除く）を
//      つないで 120 字前後で切り出す
//   3. どちらも無ければ従来の「{記事名}の学習コンテンツ」

export const ARTICLE_DESCRIPTION_MAX_LENGTH = 120;

/**
 * description の材料にする本文冒頭の段落数。getArticleMetadata の GROQ（leadBlocks）と
 * 記事ページの JSON-LD 側（leadBlocksOf）で同じ数を使い、meta と JSON-LD の文をそろえる。
 */
export const ARTICLE_DESCRIPTION_LEAD_BLOCKS = 12;

/** 本文ブロックのうち、description の材料になる最小限の形 */
export interface DescriptionSourceBlock {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: ReadonlyArray<object>;
}

function blockText(block: DescriptionSourceBlock): string {
  return (block.children ?? [])
    .map((child) => {
      const text = (child as { text?: unknown } | null)?.text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsableParagraph(block: DescriptionSourceBlock): boolean {
  if (block._type !== "block") return false;
  if ((block.style ?? "normal") !== "normal") return false;
  if (block.listItem) return false;
  const text = blockText(block);
  if (!text) return false;
  // URL だけの行（「https://...」）は要約にならない
  if (/^https?:\/\/\S+$/.test(text)) return false;
  return true;
}

/**
 * 本文の冒頭段落から約 maxLength 字の要約を作る。材料が無ければ undefined。
 * 長いときは maxLength 以内の最後の「。」で切り、無ければ maxLength-1 字 + 「…」。
 */
export function summarizePortableText(
  blocks: DescriptionSourceBlock[] | undefined | null,
  maxLength = ARTICLE_DESCRIPTION_MAX_LENGTH,
): string | undefined {
  if (!blocks || blocks.length === 0) return undefined;

  let text = "";
  for (const block of blocks) {
    if (!isUsableParagraph(block)) continue;
    text = text ? `${text} ${blockText(block)}` : blockText(block);
    if (text.length >= maxLength) break;
  }
  if (!text) return undefined;
  if (text.length <= maxLength) return text;

  const head = text.slice(0, maxLength);
  const lastPeriod = head.lastIndexOf("。");
  // 文の切れ目が半分より後ろにあれば、そこで切る（文が途切れない）
  if (lastPeriod >= Math.floor(maxLength / 2)) {
    return head.slice(0, lastPeriod + 1);
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

/** GROQ の leadBlocks と同じ条件（通常の段落・リスト以外）で本文冒頭を取り出す */
export function leadBlocksOf(
  content: DescriptionSourceBlock[] | undefined | null,
): DescriptionSourceBlock[] {
  return (content ?? [])
    .filter(
      (block) =>
        block?._type === "block" &&
        (block.style === undefined || block.style === "normal") &&
        !block.listItem,
    )
    .slice(0, ARTICLE_DESCRIPTION_LEAD_BLOCKS);
}

export function buildArticleDescription(article: {
  title: string;
  excerpt?: string | null;
  content?: DescriptionSourceBlock[] | null;
}): string {
  const excerpt = article.excerpt?.replace(/\s+/g, " ").trim();
  if (excerpt) return excerpt;
  return (
    summarizePortableText(article.content) ?? `${article.title}の学習コンテンツ`
  );
}
