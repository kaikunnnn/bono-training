/**
 * 既存 story 23件に対して、Webflow の description-3 (HTML本文) を取得し、
 * 簡易的に PortableText に変換して story.body に入れる。
 *
 * HTML 変換は簡易版:
 *   - <p>, <h2>, <h3>, <h4>, <blockquote> → 対応する PortableText block
 *   - <ol><li>, <ul><li> → list (number / bullet)
 *   - <strong>, <em>, <a href="..."> → marks
 *   - <img src="..."> → image block (外部URLそのまま、Sanity asset 化はしない)
 *   - <br> → 改行（block 内の改行は無視、別 block にする）
 *
 * 実行: npx tsx scripts/update-stories-body.ts [--dry-run]
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";
import { randomUUID } from "crypto";

config({ path: resolve(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const WEBFLOW_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN =
  process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: writeToken,
  useCdn: false,
});

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

// =======================================================
// 簡易 HTML → PortableText 変換
// =======================================================

interface PTSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface PTBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "h4" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: { _key: string; _type: string; href?: string }[];
  children: PTSpan[];
}

interface PTImage {
  _type: "image";
  _key: string;
  url: string;
  alt?: string;
}

type PTNode = PTBlock | PTImage;

/**
 * 1つの inline HTML（<strong>, <em>, <a> など含む）を spans + markDefs に分解
 */
function parseInline(
  html: string
): { children: PTSpan[]; markDefs: PTBlock["markDefs"] } {
  const markDefs: PTBlock["markDefs"] = [];
  const children: PTSpan[] = [];

  // HTML エンティティをデコード（最小限）
  const decode = (s: string) =>
    s
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

  // 簡易トークナイザ: open/close タグと text を交互に
  type Frame = { marks: string[] };
  const stack: Frame[] = [{ marks: [] }];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) break;
      const tag = html.slice(i + 1, end);
      i = end + 1;
      const isClose = tag.startsWith("/");
      const tagName = tag
        .replace(/^\//, "")
        .split(/\s+/)[0]
        .toLowerCase();
      if (isClose) {
        if (stack.length > 1) stack.pop();
      } else {
        const top = stack[stack.length - 1];
        const newMarks = [...top.marks];
        if (tagName === "strong" || tagName === "b") newMarks.push("strong");
        else if (tagName === "em" || tagName === "i") newMarks.push("em");
        else if (tagName === "a") {
          const m = tag.match(/href="([^"]+)"/);
          if (m) {
            const k = key();
            markDefs.push({ _key: k, _type: "link", href: m[1] });
            newMarks.push(k);
          }
        } else if (tagName === "br") {
          children.push({
            _type: "span",
            _key: key(),
            text: "\n",
            marks: top.marks,
          });
          continue; // self-closing
        }
        // self-closing 風（br, img）は stack に積まない
        if (tagName !== "br" && tagName !== "img" && !tag.endsWith("/")) {
          stack.push({ marks: newMarks });
        }
      }
    } else {
      const next = html.indexOf("<", i);
      const text = decode(html.slice(i, next === -1 ? undefined : next));
      if (text.length > 0) {
        children.push({
          _type: "span",
          _key: key(),
          text,
          marks: stack[stack.length - 1].marks,
        });
      }
      i = next === -1 ? html.length : next;
    }
  }

  if (children.length === 0) {
    children.push({ _type: "span", _key: key(), text: "", marks: [] });
  }
  return { children, markDefs };
}

function buildBlock(
  style: PTBlock["style"],
  inlineHtml: string,
  list?: { type: "bullet" | "number"; level?: number }
): PTBlock {
  const { children, markDefs } = parseInline(inlineHtml);
  const b: PTBlock = {
    _type: "block",
    _key: key(),
    style,
    markDefs,
    children,
  };
  if (list) {
    b.listItem = list.type;
    b.level = list.level ?? 1;
  }
  return b;
}

function htmlToBlocks(html: string): PTNode[] {
  const blocks: PTNode[] = [];

  // ブロックレベルタグを順番に取り出す
  const tagRe =
    /<(p|h2|h3|h4|blockquote|ol|ul|figure|img)([^>]*)>([\s\S]*?)<\/\1>|<img([^>]*?)\/?>/gi;

  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    const tag = (m[1] || "img").toLowerCase();
    const attrs = m[2] || m[4] || "";
    const inner = m[3] || "";

    if (tag === "p") {
      const stripped = inner.trim();
      if (!stripped) continue;
      // ​（ゼロ幅）や ‍ のような不可視のみは除外
      if (/^[​‌‍⁠\s‍]+$/.test(stripped)) continue;
      blocks.push(buildBlock("normal", stripped));
    } else if (tag === "h2") blocks.push(buildBlock("h2", inner));
    else if (tag === "h3") blocks.push(buildBlock("h3", inner));
    else if (tag === "h4") blocks.push(buildBlock("h4", inner));
    else if (tag === "blockquote") blocks.push(buildBlock("blockquote", inner));
    else if (tag === "ol" || tag === "ul") {
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let li;
      while ((li = liRe.exec(inner)) !== null) {
        blocks.push(
          buildBlock("normal", li[1], { type: tag === "ol" ? "number" : "bullet" })
        );
      }
    } else if (tag === "figure") {
      // figure 内の <img> を取り出す
      const imgM = inner.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/);
      if (imgM) {
        blocks.push({ _type: "image", _key: key(), url: imgM[1], alt: imgM[2] });
      }
    } else if (tag === "img") {
      const srcM = attrs.match(/src="([^"]+)"/);
      const altM = attrs.match(/alt="([^"]*)"/);
      if (srcM) {
        blocks.push({
          _type: "image",
          _key: key(),
          url: srcM[1],
          alt: altM?.[1] || "",
        });
      }
    }
  }

  return blocks;
}

// =======================================================
// Webflow からデータ取得
// =======================================================

async function fetchWebflowDescriptions(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}` } }
    );
    if (!res.ok) {
      console.error(`Webflow API error: ${res.status}`);
      break;
    }
    const data: {
      items: Array<{ fieldData?: { slug?: string; "description-3"?: string } }>;
      pagination?: { total?: number };
    } = await res.json();
    for (const item of data.items) {
      const slug = item.fieldData?.slug;
      const desc = item.fieldData?.["description-3"];
      if (slug && desc) map.set(slug, desc);
    }
    offset += limit;
    if (offset >= (data.pagination?.total ?? 0)) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  return map;
}

// =======================================================
// メイン
// =======================================================

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  const stories: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "story"]{ _id, "slug": slug.current }`
  );

  console.log(`対象: ${stories.length}件`);
  console.log(`Webflow から HTML 本文取得中...`);
  const webflowMap = await fetchWebflowDescriptions();
  console.log(`Webflow から ${webflowMap.size} 件の HTML 取得\n`);

  let updated = 0;
  let skipped = 0;

  for (const story of stories) {
    const html = webflowMap.get(story.slug);
    if (!html) {
      console.log(`⏭  ${story.slug} → Webflow に description-3 なし`);
      skipped++;
      continue;
    }
    const blocks = htmlToBlocks(html);
    console.log(`📝 ${story.slug} → ${blocks.length} blocks`);

    if (DRY_RUN) {
      // 最初の3 block だけサンプル表示
      for (const b of blocks.slice(0, 3)) {
        if (b._type === "block") {
          const text = b.children.map((c) => c.text).join("");
          console.log(
            `     [${b.style}${b.listItem ? ` ${b.listItem}` : ""}] ${text.slice(0, 60)}`
          );
        } else if (b._type === "image") {
          console.log(`     [image] ${b.url}`);
        }
      }
      continue;
    }

    await client.patch(story._id).set({ body: blocks }).commit();
    console.log(`     ✅ 更新完了`);
    updated++;
  }

  console.log(`\n=== 完了 ===`);
  console.log(`更新: ${updated} / スキップ: ${skipped} / 全 ${stories.length}`);
}

main().catch(console.error);
