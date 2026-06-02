/**
 * 指定 slug の記事が Sanity と Webflow にあるかを調査する。
 *   - Sanity 側: article / story の存在
 *   - Webflow 側: Item の中身（本文含む）
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const TARGET_SLUG = "youhadouyatedezainani-wake";
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

async function main() {
  // ---- 1) Sanity の article 側を確認 ----
  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{
      _id, title, slug, publishedAt, excerpt, tags, author, thumbnailUrl,
      "hasThumbnail": defined(thumbnail.asset._ref),
      "contentBlocks": count(content),
      "questTitle": *[_type == "quest" && ^._id in articles[]._ref][0].title,
      "lessonSlug": *[_type == "quest" && ^._id in articles[]._ref][0].lesson->slug.current
    }`,
    { slug: TARGET_SLUG }
  );
  console.log("=== Sanity article ===");
  console.log(JSON.stringify(article, null, 2));

  // ---- 2) Sanity の story 側を確認 ----
  const story = await client.fetch(
    `*[_type == "story" && slug.current == $slug][0]{
      _id, title, slug, publishedAt, "bodyBlocks": count(body)
    }`,
    { slug: TARGET_SLUG }
  );
  console.log("\n=== Sanity story ===");
  console.log(JSON.stringify(story, null, 2));

  // ---- 3) Webflow API から記事 Item を検索 ----
  console.log("\n=== Webflow Item 検索中... ===");
  let offset = 0;
  const limit = 100;
  let found:
    | {
        id: string;
        lastPublished?: string | null;
        createdOn?: string;
        fieldData: Record<string, unknown>;
      }
    | null = null;

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
      items: Array<{
        id: string;
        lastPublished?: string | null;
        createdOn?: string;
        fieldData: { slug?: string } & Record<string, unknown>;
      }>;
      pagination?: { total?: number };
    } = await res.json();

    for (const item of data.items) {
      if (item.fieldData?.slug === TARGET_SLUG) {
        found = item;
        break;
      }
    }
    if (found) break;
    offset += limit;
    if (offset >= (data.pagination?.total ?? 0)) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!found) {
    console.log("該当する Webflow Item が見つかりませんでした");
    return;
  }

  // ---- 4) Webflow Item の構造表示（フィールド名と各値の文字数だけ）----
  console.log("\n=== Webflow Item (要約) ===");
  console.log(`id: ${found.id}`);
  console.log(`lastPublished: ${found.lastPublished}`);
  console.log(`createdOn: ${found.createdOn}`);
  console.log(`\nfieldData keys:`);
  for (const [k, v] of Object.entries(found.fieldData)) {
    if (typeof v === "string") {
      console.log(`  ${k}: string(${v.length})  preview="${v.slice(0, 80).replace(/\n/g, " ")}"`);
    } else if (typeof v === "object" && v !== null) {
      console.log(`  ${k}: object → ${JSON.stringify(v).slice(0, 100)}`);
    } else {
      console.log(`  ${k}: ${typeof v} = ${v}`);
    }
  }

  // ---- 5) 本文っぽいフィールドの本体を出力 ----
  console.log("\n=== Webflow Item 本文フィールド ===");
  const candidates = ["post-body", "rich-text", "body", "content", "post-content"];
  for (const key of candidates) {
    const v = (found.fieldData as Record<string, unknown>)[key];
    if (v) {
      console.log(`\n--- ${key} ---`);
      console.log(typeof v === "string" ? v.slice(0, 500) : JSON.stringify(v).slice(0, 500));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
