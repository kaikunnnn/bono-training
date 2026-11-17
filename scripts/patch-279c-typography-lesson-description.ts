/**
 * rebono 279-C 組1-6 タイポグラフィ入門（/lessons/ui-typography）の説明文を直す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279c-typography-lesson-description.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279c-typography-lesson-description.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 説明文は検索結果の説明文、レッスンページの見出し下、レッスン一覧のカード（2行まで）に出る。
 * 今の値が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "UI7w687pXD97MhCMio5KuY"; // lesson: ui-typography

const BEFORE = "UIデザインの基本になるフォント選び・サイズ・選択の法則";
const AFTER =
  "UIの文字（タイポグラフィ）の基本を、見比べる→Figmaで階層を設定する→ニュースアプリとレシピのUIで練習する、の順で身につけるレッスンです。";

type Doc = { _id: string; _rev: string; description: string };

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
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id,_rev,description}`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  let mismatch = false;
  for (const doc of docs) {
    const ok = doc.description === BEFORE || doc.description === AFTER;
    if (!ok) mismatch = true;
    console.log(`■ ${doc._id}`);
    console.log(`  説明文${ok ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    今:   ${doc.description}`);
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
    if (doc.description === AFTER) continue;
    await client.patch(doc._id).ifRevisionId(doc._rev).set({ description: AFTER }).commit();
    console.log(`✅ ${doc._id} を更新しました`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
