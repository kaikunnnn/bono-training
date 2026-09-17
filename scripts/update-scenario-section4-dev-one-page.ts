/**
 * セクション4の記事1を、確認用のSanity development datasetへ反映する。
 * production datasetは変更しない。
 *
 * 実行: npx tsx scripts/update-scenario-section4-dev-session.ts [--dry-run]
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const ARTICLE_ID = "sbd-section4-dev-one-page";
const TITLE = "学びを検討ドキュメントにまとめよう";
const SOURCE_PATH =
  "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/ペルソナと課題でデザインするフロー/Step4-セクション4をどうするのか/1. 学びを検討ドキュメントにまとめよう.md";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: "development",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: DRY_RUN ? process.env.SANITY_API_READ_TOKEN : process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function key() {
  return crypto.randomBytes(6).toString("hex");
}

type Span = { _type: "span"; _key: string; marks: string[]; text: string };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: [];
  children: Span[];
  level?: number;
  listItem?: "bullet" | "number";
};

function spans(text: string): Span[] {
  const parts: Span[] = [];
  const strong = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(strong)) {
    const start = match.index;
    if (start > cursor) {
      parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor, start) });
    }
    parts.push({ _type: "span", _key: key(), marks: ["strong"], text: match[1] });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) {
    parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor) });
  }
  return parts.length ? parts : [{ _type: "span", _key: key(), marks: [], text }];
}

function block(text: string, style = "normal", listItem?: "bullet" | "number"): Block {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: spans(text),
    ...(listItem ? { level: 1, listItem } : {}),
  };
}

function markdownToPortableText(raw: string): Block[] {
  const lines = raw.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const titleIndex = lines.findIndex((line) => line.trim());
  if (titleIndex < 0 || !/^#\s+/.test(lines[titleIndex].trim())) {
    throw new Error("原稿の冒頭に記事タイトルのh1がありません");
  }
  lines.splice(titleIndex, 1);

  const result: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    const text = paragraph.join(" ").trim();
    if (text) result.push(block(text));
    paragraph = [];
  };

  for (const line of lines) {
    const text = line.trim();
    if (!text) {
      flush();
      continue;
    }
    const linkcard = text.match(/^\[linkcard:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\]$/);
    if (linkcard) {
      flush();
      result.push({
        _type: "linkCard",
        _key: key(),
        title: linkcard[1],
        description: linkcard[2],
        url: linkcard[3],
      } as unknown as Block);
      continue;
    }
    const image = text.match(/^\[image:\s*(image-[a-z0-9-]+)\s*\]$/);
    if (image) {
      flush();
      result.push({
        _type: "image",
        _key: key(),
        asset: { _type: "reference", _ref: image[1] },
      } as unknown as Block);
      continue;
    }
    const heading = text.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flush();
      result.push(block(heading[2], `h${heading[1].length}`));
      continue;
    }
    const bullet = text.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flush();
      result.push(block(bullet[1], "normal", "bullet"));
      continue;
    }
    const number = text.match(/^\d+\.\s+(.+)$/);
    if (number) {
      flush();
      result.push(block(number[1], "normal", "number"));
      continue;
    }
    if (text.startsWith("> ")) {
      flush();
      result.push(block(text.slice(2), "blockquote"));
      continue;
    }
    paragraph.push(text);
  }
  flush();
  return result;
}

async function main() {
  const article = await client.getDocument(ARTICLE_ID);
  if (!article || article._type !== "article") {
    throw new Error(`確認用記事 ${ARTICLE_ID} が見つかりません`);
  }

  const content = markdownToPortableText(readFileSync(SOURCE_PATH, "utf8"));
  const headings = content
    .filter((item) => item.style?.startsWith?.("h"))
    .map((item) => item.children.map((child) => child.text).join(""));

  console.log(JSON.stringify({
    dataset: "development",
    articleId: ARTICLE_ID,
    title: TITLE,
    blocks: content.length,
    headings,
    dryRun: DRY_RUN,
  }, null, 2));

  if (DRY_RUN) return;
  const result = await client.patch(ARTICLE_ID).set({ title: TITLE, content }).commit({ visibility: "sync" });
  console.log(`更新しました: ${result._id} ${result._rev}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});

