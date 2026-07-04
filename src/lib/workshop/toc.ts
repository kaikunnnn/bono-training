/**
 * Markdown本文から目次（h2/h3）を抽出する純粋ユーティリティ。
 * WorkshopMarkdown の見出しID付与と同じ順序・同じIDを共有する。
 */

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      // 英数字・ひらがな・カタカナ・漢字・長音・ハイフン以外を除去（絵文字や記号）
      .replace(/[^\w぀-ゟ゠-ヿ一-龯０-９ａ-ｚー-]/g, "") ||
    "section"
  );
}

export function extractHeadings(markdown: string): TocItem[] {
  // コードブロック内の ## をヘッダと誤認しないよう除去
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const seen = new Map<string, number>();
  const items: TocItem[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = line.match(/^(##|###)\s+(.+)/);
    if (!match) continue;
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].replace(/\*\*/g, "").trim();
    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text, level: level as 2 | 3 });
  }
  return items;
}
