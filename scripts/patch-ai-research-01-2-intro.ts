/**
 * レッスン「デザイナーのためのAIリサーチ入門」01-2 の記事（air-article-01-2）の本文「（準備中：下書きはまだありません）」を、
 * 3行の紹介文に差し替える。#318 2026-11-27（YouTube 01-1 の概要欄からこの記事へ直接つなぐため）
 * 変えるのは content だけ。今の本文が準備中の1行のときだけ書く（Studioで書いた本文を消さないため）。下書き（drafts.）があれば止める
 * 文は import-ai-research-lesson-dev.ts の BODY_OVERRIDE と同じ
 *
 * 実行:
 *   npx tsx scripts/patch-ai-research-01-2-intro.ts --dry-run
 *   npx tsx scripts/patch-ai-research-01-2-intro.ts            # production に書き込む（オーナーが ! で実行）
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";

config({ path: "/Users/kaitakumi/Documents/bono-training/.env.local", quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = "cqszh4up";
const DATASET = "production";
const DOC_ID = "air-article-01-2";
const PLACEHOLDER_TEXT = "（準備中：下書きはまだありません）";
const LINES = [
  "AIが作った語学交換SNS「ハナソ」の新規登録フロー。見た目はきれいなのに、エラー表示も、言語を選ぶ画面もありません。",
  "この動画では、足りなかったのが「業種」と「UIの基本」の知識だったことと、それをAIでリサーチして直すとUIがどう変わるかを、ビフォーとアフターで見ていきます。",
  "調べ方の細かいコツは、このあとのクエスト02から一つずつやっていきます。",
];

const key = () => crypto.randomBytes(6).toString("hex");
const block = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN, // 下書きの有無を見るため dry-run でも鍵で読む（鍵なしだと drafts. が見えない）
  useCdn: false,
});

type Span = { text?: string };
type Blk = { _type: string; children?: Span[] };

async function main() {
  if (client.config().dataset !== DATASET || client.config().projectId !== PROJECT_ID) throw new Error("接続先が想定外です。中止します");
  const docs = await client.fetch<{ _id: string; title: string; content?: Blk[]; videoUrl?: string }[]>(
    `*[_id in [$id, $draft]]{_id, title, content, videoUrl}`,
    { id: DOC_ID, draft: `drafts.${DOC_ID}` },
  );
  const doc = docs.find((d) => d._id === DOC_ID);
  if (!doc) throw new Error(`${DOC_ID} が production にありません。中止します`);
  if (docs.some((d) => d._id.startsWith("drafts."))) throw new Error(`drafts.${DOC_ID} があります（Studioで編集中）。中止します`);
  const now = (doc.content ?? []).map((b) => (b.children ?? []).map((c) => c.text ?? "").join("")).join("\n");
  console.log(`Dataset: ${DATASET} / mode: ${DRY_RUN ? "DRY-RUN" : "WRITE"} / 鍵: ${process.env.SANITY_WRITE_TOKEN ? "あり" : "なし（下書きの確認ができていません）"}`);
  console.log(`記事: ${doc._id} ${doc.title} / videoUrl=${doc.videoUrl ?? "なし"}`);
  console.log(`今の本文:\n  ${now || "（空）"}`);
  console.log(`新しい本文:\n  ${LINES.join("\n  ")}`);
  if (now !== PLACEHOLDER_TEXT) throw new Error("今の本文が「準備中」の1行ではありません（誰かが書いた本文を消さないため中止します）");
  if (DRY_RUN) return;
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error("SANITY_WRITE_TOKEN がありません");
  const res = await client.patch(DOC_ID).set({ content: LINES.map(block) }).commit();
  console.log(`書き込み完了: ${res._id} 段落=${(res.content as unknown[]).length} _rev=${res._rev}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
