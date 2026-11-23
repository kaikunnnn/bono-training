/**
 * rebono 279-E 転職ロードマップ（/roadmap/uiux-career-change）のステップ1から、解説記事のカードを外す（Sanity 本番データ）。
 * テキストリンクに置き換えるため。既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279e-roadmap-remove-article-card.ts            # DRY RUN
 *   npx tsx scripts/patch-279e-roadmap-remove-article-card.ts --execute  # 本番に書き込む（オーナーが実行）
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const ROADMAP_ID = "oNWk1SXbyGbVYC4WgWISbP"; // roadmap: uiux-career-change
const PATH = 'steps[_key=="step1"].sections[_key=="step1sec1"].contents[_key=="step1sec1guide"]';

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

type Doc = {
  _id: string;
  _rev: string;
  items?: Array<{ _key: string; title?: string }>;
};

async function main() {
  console.log(`dataset: ${client.config().dataset} / ${EXECUTE ? "EXECUTE（本番に書き込む）" : "DRY RUN"}\n`);
  const docs = await client.fetch<Doc[]>(
    `*[_id in $ids]{_id,_rev,"items":steps[_key=="step1"][0].sections[_key=="step1sec1"][0].contents[]{_key,title}}`,
    { ids: [ROADMAP_ID, `drafts.${ROADMAP_ID}`] }
  );
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);
    console.log(`  今の並び: ${(doc.items ?? []).map((i) => i.title).join(" / ")}`);
    if (!doc.items?.some((i) => i._key === "step1sec1guide")) {
      console.log("  カードは入っていません\n");
      continue;
    }
    console.log("  外すもの: 転職ロードマップの詳しい解説\n");
    if (!EXECUTE) continue;
    await client.patch(doc._id).ifRevisionId(doc._rev).unset([PATH]).commit();
    console.log("  書き込み完了\n");
  }
  if (!EXECUTE) console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
