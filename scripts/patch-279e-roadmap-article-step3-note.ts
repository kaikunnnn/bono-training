/**
 * rebono 279-E 転職ロードマップ解説記事のステップ3に、ロードマップ未収録の案内文を1ブロック足す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279e-roadmap-article-step3-note.ts            # DRY RUN
 *   npx tsx scripts/patch-279e-roadmap-article-step3-note.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * ステップ3の見出しの直後の画像の下に入れる。すでに入っていれば何もしない。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "webflow-guide-646484a2dec32f91e47f193c"; // guide: rdm-howtostart-roadmap
const NOTE =
  "このステップは、転職ロードマップのページにはまだ入っていません。今は、下の「BONOのレッスンで身につける」のレッスンから進めてください。";
const NOTE_KEY = "step3roadmapnote";

type Node = { _key: string; _type: string; style?: string; children?: Array<{ text?: string }> };
const textOf = (n?: Node) => (n?.children ?? []).map((c) => c.text ?? "").join("");

if (EXECUTE && !process.env.SANITY_WRITE_TOKEN) {
  console.error("⚠️ SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  console.log(`dataset: ${client.config().dataset} / ${EXECUTE ? "EXECUTE（本番に書き込む）" : "DRY RUN"}\n`);
  const docs = await client.fetch<Array<{ _id: string; _rev: string; content: Node[] }>>(
    `*[_id in $ids]{_id,_rev,content}`,
    { ids: [DOC_ID, `drafts.${DOC_ID}`] }
  );
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);
    if (doc.content.some((n) => n._key === NOTE_KEY)) {
      console.log("  すでに入っています\n");
      continue;
    }
    const h = doc.content.findIndex((n) => n.style === "h2" && textOf(n).startsWith("ステップ3 "));
    const image = doc.content[h + 1 + (doc.content[h + 1]?._type === "image" ? 0 : 1)];
    if (h < 0 || image?._type !== "image") {
      console.error("⚠️ ステップ3の見出しの後に画像が見つかりません。想定と違うので止めました");
      process.exit(1);
    }
    console.log(`  見出し: ${textOf(doc.content[h])}`);
    console.log(`  入れる場所: 画像 ${image._key} の直後`);
    console.log(`  入れる文: ${NOTE}\n`);
    if (!EXECUTE) continue;
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .insert("after", `content[_key=="${image._key}"]`, [
        {
          _key: NOTE_KEY,
          _type: "block",
          style: "normal",
          markDefs: [],
          children: [{ _key: `${NOTE_KEY}-s0`, _type: "span", text: NOTE, marks: [] }],
        },
      ])
      .commit();
    console.log("  書き込み完了\n");
  }
  if (!EXECUTE) console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
