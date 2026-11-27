/**
 * レッスン「デザイナーのためのAIリサーチ入門」01-2 の記事（air-article-01-2）を新着・更新一覧に出す（publishedAt を付ける）。#318 2026-11-27 オーナー決定
 * 変えるのは publishedAt だけ。まだ publishedAt が無いときだけ書く。下書き（drafts.）があれば止める
 * 値は import-ai-research-lesson-dev.ts の PUBLISHED_AT_OVERRIDE と同じ
 *
 * 実行:
 *   npx tsx scripts/patch-ai-research-01-2-publish.ts --dry-run
 *   npx tsx scripts/patch-ai-research-01-2-publish.ts            # production に書き込む（オーナーが ! で実行）
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";

config({ path: "/Users/kaitakumi/Documents/bono-training/.env.local", quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = "cqszh4up";
const DATASET = "production";
const DOC_ID = "air-article-01-2";
const PUBLISHED_AT = "2026-11-27T03:00:00.000Z"; // 日本時間 11/27 12:00

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN, // drafts. を見るため dry-run でも鍵で読む
  useCdn: false,
});

async function main() {
  if (client.config().dataset !== DATASET || client.config().projectId !== PROJECT_ID) throw new Error("接続先が想定外です。中止します");
  const docs = await client.fetch<{ _id: string; title: string; publishedAt?: string; videoUrl?: string; n?: number }[]>(
    `*[_id in [$id, $draft]]{_id, title, publishedAt, videoUrl, "n": count(content)}`,
    { id: DOC_ID, draft: `drafts.${DOC_ID}` },
  );
  const doc = docs.find((d) => d._id === DOC_ID);
  if (!doc) throw new Error(`${DOC_ID} が production にありません。中止します`);
  if (docs.some((d) => d._id.startsWith("drafts."))) throw new Error(`drafts.${DOC_ID} があります（Studioで編集中）。中止します`);
  console.log(`Dataset: ${DATASET} / mode: ${DRY_RUN ? "DRY-RUN" : "WRITE"} / 鍵: ${process.env.SANITY_WRITE_TOKEN ? "あり" : "なし"}`);
  console.log(`記事: ${doc._id} ${doc.title} / videoUrl=${doc.videoUrl ?? "なし"} / 本文 ${doc.n ?? 0} 段落`);
  console.log(`publishedAt: ${doc.publishedAt ?? "（なし＝一覧に出ない）"} → ${PUBLISHED_AT}`);
  if (doc.publishedAt) throw new Error("すでに publishedAt があります。中止します");
  if (DRY_RUN) return;
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error("SANITY_WRITE_TOKEN がありません");
  const res = await client.patch(DOC_ID).set({ publishedAt: PUBLISHED_AT }).commit();
  console.log(`書き込み完了: ${res._id} publishedAt=${res.publishedAt} _rev=${res._rev}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
