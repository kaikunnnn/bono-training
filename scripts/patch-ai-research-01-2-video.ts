/**
 * レッスン「デザイナーのためのAIリサーチ入門」01-2 の記事（air-article-01-2）に、BONO版の動画（Vimeo）を付ける。#318 2026-11-27
 * 変えるのは videoUrl だけ（set）。ほかの項目・ほかの記事には触れない。下書き（drafts.）があれば止める
 *
 * 実行:
 *   npx tsx scripts/patch-ai-research-01-2-video.ts --dry-run   # 今の値と書き込む値を表示するだけ
 *   npx tsx scripts/patch-ai-research-01-2-video.ts             # production に書き込む（オーナーが ! で実行）
 * 書き込み鍵は bono-training/.env.local の SANITY_WRITE_TOKEN
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";

config({ path: "/Users/kaitakumi/Documents/bono-training/.env.local", quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = "cqszh4up";
const DATASET = "production";
const DOC_ID = "air-article-01-2";
const VIDEO_URL = "https://vimeo.com/1250492804"; // Vimeo「AIリサーチ：イントロ」01-2_AIが作った綺麗なUIデザインの致命的な欠点（埋め込みのみ）

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  token: DRY_RUN ? undefined : process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  if (client.config().dataset !== DATASET || client.config().projectId !== PROJECT_ID) throw new Error("接続先が想定外です。中止します");
  const docs = await client.fetch<{ _id: string; title: string; videoUrl?: string; slug?: string }[]>(
    `*[_id in [$id, $draft]]{_id, title, videoUrl, "slug": slug.current}`,
    { id: DOC_ID, draft: `drafts.${DOC_ID}` },
  );
  const doc = docs.find((d) => d._id === DOC_ID);
  if (!doc) throw new Error(`${DOC_ID} が production にありません。中止します`);
  if (docs.some((d) => d._id.startsWith("drafts."))) throw new Error(`drafts.${DOC_ID} があります（Studioで編集中）。中止します`);
  console.log(`Dataset: ${DATASET} / mode: ${DRY_RUN ? "DRY-RUN" : "WRITE"}`);
  console.log(`記事: ${doc._id} /contents/${doc.slug} ${doc.title}`);
  console.log(`videoUrl: ${doc.videoUrl ?? "（なし）"} → ${VIDEO_URL}`);
  if (DRY_RUN) return;
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error("SANITY_WRITE_TOKEN がありません");
  const res = await client.patch(DOC_ID).set({ videoUrl: VIDEO_URL }).commit();
  console.log(`書き込み完了: ${res._id} videoUrl=${res.videoUrl} _rev=${res._rev}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
