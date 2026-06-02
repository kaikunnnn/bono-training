/**
 * 投入された Story を取得して、画像参照・本文ブロックの構造を確認する。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  const slug = process.argv[2] || "youhadouyatedezainani-wake";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const story: any = await client.fetch(
    `*[_type == "story" && slug.current == $slug][0]{
      _id, title, slug, publishedAt, excerpt, category, tags,
      person,
      "heroImageUrl": heroImage.asset->url,
      "bodyBlockCount": count(body[_type == "block"]),
      "bodyImageCount": count(body[_type == "image"]),
      "bodyImageUrls": body[_type == "image"]{ "url": asset->url, caption, alt }
    }`,
    { slug }
  );

  console.log(JSON.stringify(story, null, 2));

  console.log("\n=== サマリ ===");
  console.log(`Story _id: ${story?._id}`);
  console.log(`Title: ${story?.title}`);
  console.log(`person.name: ${story?.person?.name}`);
  console.log(`heroImage: ${story?.heroImageUrl ? "✓" : "✗"} ${story?.heroImageUrl ?? ""}`);
  console.log(`Body: ${story?.bodyBlockCount} text blocks + ${story?.bodyImageCount} images`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
