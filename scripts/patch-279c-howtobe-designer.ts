/**
 * rebono 279-C 組1-3 なるには記事（/guide/rdm-howtobeadesigner）の h1 と冒頭を直す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279c-howtobe-designer.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279c-howtobe-designer.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 変える3か所
 *   - title（h1。記事カードなど、この記事のタイトルを出す場所も変わる）
 *   - 本文の1ブロック目（答えを先に書く）
 *   - 本文の2ブロック目（1ブロック目に統合するので削除）
 * 今の値が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "webflow-guide-646485877ff4a57776dad549"; // guide: rdm-howtobeadesigner

const TITLE_BEFORE = "UIUXデザイナー転職で必要なスキルと要素は何？書類落ちしない条件をプロが解説";
const TITLE_AFTER = "未経験からUI/UXデザイナーになるには？必要なスキル3つと書類で落ちない条件";

const INTRO_KEY = "9otglelrbm83";
const INTRO_BEFORE = "UIUXデザイナーとしてどんな能力が評価されるのか？こんにちはカイクンです。";
const INTRO_AFTER =
  "採用で見られるのは、ふつうに使えるUIを作る基礎、顧客の課題を解決する素養、未経験者としてのポテンシャルの3つです。この記事では、それぞれをどう身につけるかを、UIUXデザインの現場10年以上の経験と、約50人の転職者を出してきたBONOの目線でまとめます。";

const REMOVE_KEY = "bm6b6xaolbdb";
const REMOVE_BEFORE =
  "この記事ではUIUXデザインの現場10年以上の自分の目線と、約50人の転職者を出しているBONOを運営する目線から、UIUXデザイナーとしてどんな能力が評価されるのか？どういうスキルが最低限必要か？をまとめてみます。";

type Block = { _key: string; children?: Array<{ text?: string }> };
type Doc = { _id: string; _rev: string; title: string; content: Block[] };

const blockText = (doc: Doc, key: string) => {
  const block = doc.content.find((b) => b._key === key);
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
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id,_rev,title,content}`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  let mismatch = false;
  for (const doc of docs) {
    const intro = blockText(doc, INTRO_KEY);
    const removed = blockText(doc, REMOVE_KEY);
    const titleOk = doc.title === TITLE_BEFORE || doc.title === TITLE_AFTER;
    const introOk = intro === INTRO_BEFORE || intro === INTRO_AFTER;
    const removedOk = removed === REMOVE_BEFORE || removed === null;
    if (!titleOk || !introOk || !removedOk) mismatch = true;

    console.log(`■ ${doc._id}`);
    console.log(`  title${titleOk ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    今:   ${doc.title}`);
    console.log(`    直後: ${TITLE_AFTER}`);
    console.log(`  本文1ブロック目${introOk ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    今:   ${intro}`);
    console.log(`    直後: ${INTRO_AFTER}`);
    console.log(`  本文2ブロック目（削除）${removedOk ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    今:   ${removed}\n`);
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
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({
        title: TITLE_AFTER,
        [`content[_key=="${INTRO_KEY}"].children`]: [
          { _type: "span", _key: `${INTRO_KEY}-s0`, text: INTRO_AFTER, marks: [] },
        ],
      })
      .unset([`content[_key=="${REMOVE_KEY}"]`])
      .commit();
    console.log(`✅ ${doc._id} を更新しました`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
