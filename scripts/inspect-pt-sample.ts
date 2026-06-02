/**
 * import-ai-ui-styling-lesson.ts と同じ変換ロジックを呼び出して
 * 1 記事の Portable Text を標準出力する確認用スクリプト。
 */

import fs from "fs";
import crypto from "crypto";

const FILE = process.argv[2];
if (!FILE) {
  console.error("Usage: npx tsx scripts/inspect-pt-sample.ts <markdown-file>");
  process.exit(1);
}

function randKey(len = 12): string {
  return crypto.randomBytes(len / 2).toString("hex");
}

type PtSpan = { _type: "span"; _key: string; marks: string[]; text: string };
type PtMarkDef = { _key: string; _type: string; href?: string };
type PtBlock = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: PtMarkDef[];
  children: PtSpan[];
  level?: number;
  listItem?: string;
};

function stripMeta(raw: string): string {
  let out = raw;
  out = out.replace(/^---\n[\s\S]*?\n---\n?/, "");
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  return out.trim();
}

function parseInline(text: string): { spans: PtSpan[]; markDefs: PtMarkDef[] } {
  const markDefs: PtMarkDef[] = [];
  const tokens: Array<{ marks: string[]; text: string }> = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex)
      tokens.push({ marks: [], text: text.slice(lastIndex, m.index) });
    if (m[1]) {
      const linkKey = randKey();
      markDefs.push({ _key: linkKey, _type: "link", href: m[3] });
      tokens.push({ marks: [linkKey], text: m[2] });
    } else if (m[4]) {
      tokens.push({ marks: ["strong"], text: m[5] });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) tokens.push({ marks: [], text: text.slice(lastIndex) });
  if (tokens.length === 0) tokens.push({ marks: [], text });
  const spans: PtSpan[] = tokens
    .filter((t) => t.text.length > 0)
    .map((t) => ({ _type: "span", _key: randKey(), marks: t.marks, text: t.text }));
  return { spans, markDefs };
}

function buildBlock(
  text: string,
  style: string,
  opts: { level?: number; listItem?: string } = {}
): PtBlock {
  const { spans, markDefs } = parseInline(text);
  const block: PtBlock = {
    _type: "block",
    _key: randKey(),
    style,
    markDefs,
    children: spans,
  };
  if (opts.level) block.level = opts.level;
  if (opts.listItem) block.listItem = opts.listItem;
  return block;
}

function markdownToPortableText(md: string): PtBlock[] {
  const lines = stripMeta(md).split("\n");
  const blocks: PtBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) blocks.push(buildBlock(text, "normal"));
    paragraph = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    const h = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flush();
      blocks.push(buildBlock(h[2], `h${Math.min(h[1].length, 4)}`));
      continue;
    }
    const q = trimmed.match(/^>\s?(.*)$/);
    if (q) {
      flush();
      blocks.push(buildBlock(q[1], "blockquote"));
      continue;
    }
    const ul = trimmed.match(/^[-*]\s+(.+)$/);
    if (ul) {
      flush();
      blocks.push(buildBlock(ul[1], "normal", { level: 1, listItem: "bullet" }));
      continue;
    }
    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      flush();
      blocks.push(buildBlock(ol[1], "normal", { level: 1, listItem: "number" }));
      continue;
    }
    paragraph.push(trimmed);
  }
  flush();
  return blocks;
}

const raw = fs.readFileSync(FILE, "utf8");
const blocks = markdownToPortableText(raw);
console.log(JSON.stringify(blocks, null, 2));
console.log(`\n--- total blocks: ${blocks.length} ---`);
