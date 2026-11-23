/**
 * rebono 279-C 組1-5 タイポグラフィ階層の記事（/contents/ui-typography-2-1）に、前の記事への1行リンクを足す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279c-typography-hierarchy.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279c-typography-hierarchy.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 冒頭の文は変えない。冒頭の段落の直後に1ブロック足すだけ。
 * 冒頭の段落が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "UI7w687pXD97MhCMio5JGw"; // article: ui-typography-2-1

const INTRO_KEY = "02ad2257ef34";
const INTRO_STARTS = "まずは、UIデザインの基本となるタイポグラフィを、階層ごとに種類を分けて登録しましょう。";

const NEW_KEY = "279c5prevlink";
const LINK_KEY = "279c5prevhref";
const LINK_HREF = "https://www.bo-no.design/contents/ui-typography-1-2";
const TEXT_BEFORE = "AとBのUIを見比べて、タイポグラフィで変わる体験を確かめる前の記事は、";
const TEXT_LINK = "こちら";

const NEW_BLOCK = {
  _key: NEW_KEY,
  _type: "block",
  style: "normal",
  markDefs: [{ _key: LINK_KEY, _type: "link", href: LINK_HREF }],
  children: [
    { _key: `${NEW_KEY}-s0`, _type: "span", marks: [], text: TEXT_BEFORE },
    { _key: `${NEW_KEY}-s1`, _type: "span", marks: [LINK_KEY], text: TEXT_LINK },
  ],
};

type Block = { _key: string; children?: Array<{ text?: string }> };
type Doc = { _id: string; _rev: string; content: Block[] };

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
    const intro = doc.content.find((b) => b._key === INTRO_KEY);
    const introText = (intro?.children ?? []).map((c) => c.text ?? "").join("");
    const ok = introText.startsWith(INTRO_STARTS);
    if (!ok) mismatch = true;
    const done = doc.content.some((b) => b._key === NEW_KEY);

    console.log(`■ ${doc._id}`);
    console.log(`  冒頭の段落（変えない）${ok ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    ${introText}`);
    console.log(`  直後に足す${done ? "（足し済み）" : ""}`);
    console.log(`    ${TEXT_BEFORE}[${TEXT_LINK}](${LINK_HREF})\n`);
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
    if (doc.content.some((b) => b._key === NEW_KEY)) continue;
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .insert("after", `content[_key=="${INTRO_KEY}"]`, [NEW_BLOCK])
      .commit();
    console.log(`✅ ${doc._id} を更新しました`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
