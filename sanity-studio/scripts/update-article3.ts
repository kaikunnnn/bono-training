/**
 * 記事3（理想の体験）を最新原稿で更新
 */
import { createClient } from "@sanity/client";
import * as fs from "fs";

const client = createClient({
  projectId: "cqszh4up",
  dataset: process.env.SANITY_STUDIO_DATASET || "development",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const ARTICLE_ID = "EEIdBlze5ccSdWUFeGu53d";
const FILE_PATH = "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/02_Projects/02_情報設計/03_corse_content/ver2/04_フレーム2/02_作成原稿.md";

let kc = 0;
const key = () => `k${Date.now().toString(36)}${(kc++).toString(36)}`;

function parseInline(text: string): { children: any[]; markDefs: any[] } {
  const markDefs: any[] = [];
  const children: any[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) children.push({ _type: "span", _key: key(), text: text.slice(last, m.index), marks: [] });
    if (m[2] !== undefined) {
      children.push({ _type: "span", _key: key(), text: m[2], marks: ["strong"] });
    } else if (m[3] !== undefined) {
      children.push({ _type: "span", _key: key(), text: m[3], marks: [] });
    } else if (m[4] && m[5]) {
      const lk = key();
      markDefs.push({ _type: "link", _key: lk, href: m[5] });
      children.push({ _type: "span", _key: key(), text: m[4], marks: [lk] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _type: "span", _key: key(), text: text.slice(last), marks: [] });
  if (!children.length) children.push({ _type: "span", _key: key(), text, marks: [] });
  return { children, markDefs };
}

function blk(style: string, text: string): any {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: key(), style, children, markDefs };
}

function listBlk(text: string, listItem: "bullet" | "number"): any {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: key(), style: "normal", listItem, level: 1, children, markDefs };
}

function mdToPortableText(md: string): any[] {
  const blocks: any[] = [];
  const lines = md.split("\n");
  let i = 0, para: string[] = [];

  const flush = () => {
    if (!para.length) return;
    const t = para.join(" ").trim();
    if (t) blocks.push(blk("normal", t));
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      flush(); i++;
      const code: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(...mdToPortableText(code.join("\n")));
      continue;
    }
    if (/^---+$/.test(line.trim())) { flush(); i++; continue; }
    const h4 = line.match(/^####\s+(.*)/); if (h4) { flush(); blocks.push(blk("h4", h4[1])); i++; continue; }
    const h3 = line.match(/^###\s+(.*)/);  if (h3) { flush(); blocks.push(blk("h3", h3[1])); i++; continue; }
    const h2 = line.match(/^##\s+(.*)/);   if (h2) { flush(); blocks.push(blk("h2", h2[1])); i++; continue; }
    if (/^>\s*$/.test(line)) { flush(); i++; continue; } // 空の引用行はスキップ
    const bq = line.match(/^>\s?(.*)/);    if (bq) { flush(); if (bq[1].trim()) blocks.push(blk("blockquote", bq[1])); i++; continue; }
    const bl = line.match(/^[-*]\s+(.*)/); if (bl) { flush(); blocks.push(listBlk(bl[1], "bullet")); i++; continue; }
    const nl = line.match(/^\d+\.\s+(.*)/);if (nl) { flush(); blocks.push(listBlk(nl[1], "number")); i++; continue; }
    if (/^\[.*\]$/.test(line.trim()) || /^👇/.test(line.trim())) { flush(); i++; continue; }
    if (line.trim() === "") { flush(); i++; continue; }
    para.push(line);
    i++;
  }
  flush();
  return blocks;
}

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ SANITY_API_TOKEN が設定されていません");
    return;
  }

  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  const lines = raw.split("\n");

  // タイトルとtype抽出
  const titleLine = lines.find(l => /^#\s+タイトル[：:]/.test(l));
  const title = titleLine?.replace(/^#\s+タイトル[：:]\s*/, "").trim() ?? "";
  const typeLine = lines.find(l => /^type\s*:/.test(l));
  const articleType = typeLine?.replace(/^type\s*:\s*/, "").trim() ?? "practice";

  // ヘッダー行を除いた本文
  const bodyStart = lines.findIndex((l, idx) => idx > 2 && l.trim() && !l.startsWith("#") && !l.startsWith("type"));
  const body = lines.slice(bodyStart).join("\n");
  const content = mdToPortableText(body);

  console.log(`タイトル : ${title}`);
  console.log(`タイプ   : ${articleType}`);
  console.log(`ブロック数: ${content.length}`);
  console.log("更新中...");

  await client.patch(ARTICLE_ID).set({
    title,
    articleType,
    content,
    publishedAt: new Date().toISOString(),
  }).commit();

  console.log(`✅ 更新完了 (ID: ${ARTICLE_ID})`);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
