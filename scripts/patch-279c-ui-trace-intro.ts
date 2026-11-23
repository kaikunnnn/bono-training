/**
 * rebono 279-C 組1-7 UIトレースの記事（/contents/uitrasebeginner）の冒頭を直す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279c-ui-trace-intro.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279c-ui-trace-intro.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 最初の段落だけを置き換える。この記事の検索向け説明文は本文の先頭から作られるので、そこも一緒に変わる。
 * 今の値が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "g4rl1HmkpTXIsvYhaJuCdk"; // article: uitrasebeginner

const INTRO_KEY = "e00ac3525bc4";
const SPAN_KEY = "2ac5727e40e6";
const BEFORE =
  "UIデザインの練習として既存UIを真似してデザインしてみましょう。\nツールの使い方に慣れつつ、UIのパーツをを1つずつ作成してデザインに慣れていきましょう";
const AFTER =
  "UIトレースは、今あるサービスの画面を真似して作る練習です。目的はデザインが上手くなることではなく、ツールの使い方とUIのパーツに慣れること。まずは主要なサービスを3つトレースしましょう。";

type Block = { _key: string; children?: Array<{ text?: string }> };
type Doc = { _id: string; _rev: string; content: Block[] };

const introText = (doc: Doc) => {
  const block = doc.content.find((b) => b._key === INTRO_KEY);
  return block ? (block.children ?? []).map((c) => c.text ?? "").join("") : null;
};

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

  // 公開版と、あれば下書き（drafts.）の両方を対象にする
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id,_rev,content}`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  let mismatch = false;
  for (const doc of docs) {
    const intro = introText(doc);
    const ok = intro === BEFORE || intro === AFTER;
    if (!ok) mismatch = true;
    console.log(`■ ${doc._id}`);
    console.log(`  最初の段落${ok ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    今:   ${intro}`);
    console.log(`    直後: ${AFTER}\n`);
  }

  if (mismatch) {
    console.error("⚠️ 想定と違う値があるので止めました。Studio で誰かが直していないか確認してください");
    process.exit(1);
  }
  if (!EXECUTE) {
    console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
    return;
  }

  for (const doc of docs) {
    if (introText(doc) === AFTER) continue;
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({
        [`content[_key=="${INTRO_KEY}"].children`]: [
          { _type: "span", _key: SPAN_KEY, text: AFTER, marks: [] },
        ],
      })
      .commit();
    console.log(`✅ ${doc._id} を更新しました`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
