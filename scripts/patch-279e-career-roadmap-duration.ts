/**
 * rebono 279-E 転職ロードマップ（/roadmap/uiux-career-change）の期間を「約1年」にそろえる（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279e-career-roadmap-duration.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279e-career-roadmap-duration.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * ⚠️ PR #296（バッジの「約」「年」表示対応）が本番に出てから実行すること。
 *    先に書くとバッジが「約1年ヶ月」と表示される。
 *
 * 変える3か所
 *   - tagline（ヒーローの一文）
 *   - estimatedDuration（目安のバッジ）
 *   - description（流れの説明。/roadmap 一覧カードにも出る）
 * 今の値が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "oNWk1SXbyGbVYC4WgWISbP"; // roadmap: uiux-career-change

const CHANGES: Record<string, { before: string; after: string }> = {
  tagline: {
    before: "未経験から6ヶ月でUIUXデザイナーへ。転職に必要なスキルを体系的に学ぼう",
    after: "未経験なら約1年で、UI/UXデザイナーへの転職に必要なスキルを体系的に学ぼう",
  },
  estimatedDuration: {
    before: "6-9",
    after: "約1年",
  },
  description: {
    before:
      "UIデザインの基礎から、情報設計、UXデザインまで。転職に必要なスキルを6ヶ月で体系的に学ぶロードマップ。",
    after:
      "UIデザインの基礎から、情報設計、UXデザインまで。転職に必要なスキルを約1年で体系的に学ぶロードマップ。",
  },
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
  const ids = [DOC_ID, `drafts.${DOC_ID}`];
  const docs = await client.fetch<Array<Record<string, string> & { _id: string; _rev: string }>>(
    `*[_id in $ids]{_id,_rev,tagline,estimatedDuration,description}`,
    { ids },
  );
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  let mismatch = false;
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);
    for (const [field, { before, after }] of Object.entries(CHANGES)) {
      const now = doc[field];
      const ok = now === before || now === after;
      if (!ok) mismatch = true;
      console.log(`  ${field}${ok ? "" : "  ⚠️ 今の値が想定と違う"}`);
      console.log(`    今:   ${now}`);
      console.log(`    直後: ${after}`);
    }
    console.log("");
  }

  if (mismatch) {
    console.error("⚠️ 想定と違う値があるので止めました。Studio で誰かが直していないか確認してください");
    process.exit(1);
  }
  if (!EXECUTE) {
    console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
    return;
  }

  const set = Object.fromEntries(Object.entries(CHANGES).map(([k, v]) => [k, v.after]));
  for (const doc of docs) {
    await client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit();
    console.log(`✅ ${doc._id} を更新しました`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
