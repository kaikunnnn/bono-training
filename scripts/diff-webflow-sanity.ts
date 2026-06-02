/**
 * Webflow の元 HTML と Sanity に投入された Portable Text を突合する。
 *   - h2 数
 *   - strong 数
 *   - 画像数
 *   - 段落数
 *   - 文字数 (plain text)
 *   - 「編集メモ」など気になる文言の検出
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const TARGET_SLUG = process.argv[2] || "youhadouyatedezainani-wake";
const WEBFLOW_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN =
  process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function fetchWebflowHtml(slug: string): Promise<string> {
  let offset = 0;
  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=100&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}` } }
    );
    const data = await res.json();
    for (const item of data.items) {
      if (item.fieldData.slug === slug) return item.fieldData["description-3"] || "";
    }
    offset += 100;
    if (offset >= (data.pagination?.total ?? 0)) break;
  }
  return "";
}

function countTag(html: string, tag: string): number {
  const re = new RegExp(`<${tag}\\b`, "g");
  return (html.match(re) || []).length;
}

function htmlPlainTextLength(html: string): number {
  return html.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "_").replace(/\s+/g, "").length;
}

async function main() {
  const html = await fetchWebflowHtml(TARGET_SLUG);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const story: any = await client.fetch(
    `*[_type == "story" && slug.current == $slug][0]{
      _id,
      body
    }`,
    { slug: TARGET_SLUG }
  );

  if (!html || !story) {
    console.error("元データまたは投入データが見つかりません");
    process.exit(1);
  }

  // ---- Webflow 側統計 ----
  const wf = {
    h2: countTag(html, "h2"),
    h3: countTag(html, "h3"),
    p: countTag(html, "p"),
    strong: countTag(html, "strong"),
    em: countTag(html, "em"),
    a: countTag(html, "a"),
    img: countTag(html, "img"),
    figcaption: countTag(html, "figcaption"),
    plainLen: htmlPlainTextLength(html),
  };

  // ---- Sanity 側統計 ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = story.body;
  let sH2 = 0,
    sH3 = 0,
    sNormal = 0,
    sStrong = 0,
    sEm = 0,
    sLink = 0,
    sImg = 0,
    sCap = 0,
    sLen = 0;
  for (const b of blocks) {
    if (b._type === "image") {
      sImg++;
      if (b.caption) sCap++;
      continue;
    }
    if (b._type !== "block") continue;
    if (b.style === "h2") sH2++;
    else if (b.style === "h3") sH3++;
    else if (b.style === "normal") sNormal++;
    for (const c of b.children ?? []) {
      const marks: string[] = c.marks ?? [];
      if (marks.includes("strong")) sStrong++;
      if (marks.includes("em")) sEm++;
      // markDefs の link 参照
      for (const k of marks) {
        if ((b.markDefs ?? []).some((d: { _key: string; _type: string }) => d._key === k && d._type === "link")) {
          sLink++;
        }
      }
      sLen += (c.text || "").replace(/\s+/g, "").length;
    }
  }

  console.log("=== 突合結果 ===\n");
  console.log("項目        | Webflow | Sanity | 一致");
  console.log("------------+---------+--------+----");
  const rows: [string, number, number][] = [
    ["h2", wf.h2, sH2],
    ["h3", wf.h3, sH3],
    ["p(段落)", wf.p, sNormal],
    ["strong", wf.strong, sStrong],
    ["em", wf.em, sEm],
    ["link(a)", wf.a, sLink],
    ["img", wf.img, sImg],
    ["caption", wf.figcaption, sCap],
  ];
  for (const [name, w, s] of rows) {
    const ok = w === s ? "✓" : "✗";
    console.log(`${name.padEnd(11)} | ${String(w).padStart(7)} | ${String(s).padStart(6)} | ${ok}`);
  }
  console.log(`\nテキスト文字数（空白除く）: Webflow=${wf.plainLen}  Sanity=${sLen}  差分=${wf.plainLen - sLen}`);

  // ---- 気になる文言検出 ----
  const sanityFullText = blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((b: any) => b._type === "block")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .flatMap((b: any) => (b.children ?? []).map((c: { text: string }) => c.text))
    .join("\n");

  console.log("\n=== 気になる文言検出 ===");
  const suspicious = [
    "サムネにする画像を貼る",
    "[🖼️",
    "TODO",
    "編集中",
    "メモ",
  ];
  for (const word of suspicious) {
    const hit = sanityFullText.includes(word);
    console.log(`  ${hit ? "⚠️ 検出" : "✓ なし"}  "${word}"`);
  }

  // ---- 先頭ブロックの中身を出力 ----
  console.log("\n=== Sanity body 先頭 8 ブロック ===");
  for (const [i, b] of blocks.slice(0, 8).entries()) {
    if (b._type === "image") {
      console.log(`[${i}] image  caption="${b.caption ?? ""}"`);
    } else {
      const text = (b.children ?? []).map((c: { text: string; marks: string[] }) => {
        if (c.marks?.length) return `<${c.marks.join(",")}>${c.text}</>`;
        return c.text;
      }).join("");
      console.log(`[${i}] ${b.style}  ${text.slice(0, 100)}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
