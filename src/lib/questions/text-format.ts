/**
 * 掲示板テキスト書式のマークダウン風記法を扱う純粋関数群（#146 T20）。
 *
 * 対応記法（案1・最小セット）:
 * - 行頭 `## ` → 見出し（h3 ブロック）
 * - 連続する行頭 `- ` → 箇条書き（bullet listItem ブロック）
 * - インライン `**太字**` → strong マーク
 *
 * 割り切り:
 * - エスケープ記法は用意しない（`\*` 等は特別扱いせずそのまま出力）
 * - 記号が閉じないインライン `**`（奇数個）はテキストとしてそのまま残す
 * - ネストしたリスト・番号付きリスト・リンク記法などは対象外
 *
 * この記法は「保存時に Portable Text へ変換する（投稿本文）」用途と、
 * 「保存はプレーンのまま表示時にだけ書式適用する（コメント／プレビュー）」用途の
 * 両方で共有するため、React 等の表示層に一切依存しない。
 */

import type { PortableTextBlock } from "@portabletext/types";

// ---------------------------------------------------------------------------
// インライン: **太字** の解析
// ---------------------------------------------------------------------------

/** 表示／プレビュー用の中間表現: 1 行内のテキストラン */
export type InlineRun =
  | { type: "text"; text: string }
  | { type: "strong"; text: string };

/**
 * 1 行分のテキストを `**...**` で分割し、text / strong のランに分解する。
 * `**` が閉じない（奇数個）場合、閉じられなかった `**` 以降はテキストとして残す。
 */
export function parseInlineRuns(line: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const regex = /\*\*([^*]+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ type: "text", text: line.slice(lastIndex, match.index) });
    }
    runs.push({ type: "strong", text: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    runs.push({ type: "text", text: line.slice(lastIndex) });
  }

  // 空行は空の text ラン 1 つに正規化（呼び出し側で扱いやすくする）
  if (runs.length === 0) {
    runs.push({ type: "text", text: "" });
  }

  return runs;
}

// ---------------------------------------------------------------------------
// ブロック: 表示／プレビュー用の中間表現
// ---------------------------------------------------------------------------

export type FormattedBlock =
  | { type: "normal"; runs: InlineRun[] }
  | { type: "h3"; runs: InlineRun[] }
  | { type: "listItem"; runs: InlineRun[] };

/** 行頭が `## ` の見出しか判定し、記号を除いた本文を返す */
function matchHeading(line: string): string | null {
  return line.startsWith("## ") ? line.slice(3) : null;
}

/** 行頭が `- ` の箇条書きか判定し、記号を除いた本文を返す */
function matchListItem(line: string): string | null {
  return line.startsWith("- ") ? line.slice(2) : null;
}

/**
 * プレーンテキストを表示／プレビュー用のブロック配列へ分解する純粋関数。
 * 空行は「段落の区切り」として扱い、連続する通常行は改行込みで 1 つの normal ブロックにまとめる。
 * （詳細ページの normal は `whitespace-pre-line` で改行を保持するため、この結合で表示が一致する）
 */
export function parseFormattedText(text: string): FormattedBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: FormattedBlock[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    // 通常段落は改行を保持したまま 1 ブロックに（各行を個別にインライン解析して連結）
    const joined = paragraphLines.join("\n");
    blocks.push({ type: "normal", runs: parseInlineRuns(joined) });
    paragraphLines = [];
  };

  for (const line of lines) {
    const heading = matchHeading(line);
    if (heading !== null) {
      flushParagraph();
      blocks.push({ type: "h3", runs: parseInlineRuns(heading) });
      continue;
    }

    const listItem = matchListItem(line);
    if (listItem !== null) {
      flushParagraph();
      blocks.push({ type: "listItem", runs: parseInlineRuns(listItem) });
      continue;
    }

    if (line.trim() === "") {
      // 空行は段落区切り。連続空行で空段落を作らない。
      flushParagraph();
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  return blocks;
}

// ---------------------------------------------------------------------------
// Portable Text 変換（保存時・投稿本文用）
// ---------------------------------------------------------------------------

interface PortableSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

/** インラインランを Portable Text の span 配列へ変換 */
function runsToSpans(runs: InlineRun[], keyPrefix: string): PortableSpan[] {
  return runs.map((run, i) => ({
    _type: "span" as const,
    _key: `${keyPrefix}-span-${i}`,
    text: run.text,
    marks: run.type === "strong" ? ["strong"] : [],
  }));
}

/**
 * プレーンテキストを Portable Text ブロック配列へ変換する（投稿本文の保存用）。
 *
 * 既存投稿（`## ` → h3 / それ以外 → normal、span は marks: []）と後方互換:
 * - 記法を含まない従来テキストは、従来と同じ normal / h3 の形になる
 * - 新たに `- ` 箇条書きと `**太字**` が有効になる
 *
 * 出力は現行 route.ts の生成物と同じ block 形状（_type/_key/style/children/markDefs）。
 * bullet は Sanity 標準の listItem: "bullet" / level: 1 で表現する。
 */
export function textToPortableBlocks(text: string): PortableTextBlock[] {
  const formatted = parseFormattedText(text);

  return formatted.map((block, index) => {
    const key = `block-${index}`;
    const children = runsToSpans(block.runs, key);

    if (block.type === "h3") {
      return {
        _type: "block",
        _key: key,
        style: "h3",
        children,
        markDefs: [],
      } as unknown as PortableTextBlock;
    }

    if (block.type === "listItem") {
      return {
        _type: "block",
        _key: key,
        style: "normal",
        listItem: "bullet",
        level: 1,
        children,
        markDefs: [],
      } as unknown as PortableTextBlock;
    }

    return {
      _type: "block",
      _key: key,
      style: "normal",
      children,
      markDefs: [],
    } as unknown as PortableTextBlock;
  });
}
