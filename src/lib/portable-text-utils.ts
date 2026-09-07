import type { PortableTextBlock } from "@portabletext/types";

/**
 * Portable Text から先頭 N "行" 相当のプレーンテキストを抽出する。
 * メンバー限定の本文を、未ログイン/無料会員には冒頭だけ見せる用途。
 *
 * 改行（"\n"）と段落区切りの両方で行数をカウント。
 */
export function extractPreviewText(
  blocks: PortableTextBlock[] | undefined,
  maxLines: number,
): string {
  if (!blocks || blocks.length === 0) return "";
  const lines: string[] = [];
  for (const block of blocks) {
    if (lines.length >= maxLines) break;
    if (block._type !== "block") continue;
    const text = (block.children ?? [])
      .map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
      .join("");
    if (!text.trim()) continue;
    for (const line of text.split(/\r?\n/)) {
      if (lines.length >= maxLines) break;
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
    }
  }
  return lines.join("\n");
}
