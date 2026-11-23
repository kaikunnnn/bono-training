/**
 * rebono 279-E 転職ロードマップ（/roadmap/uiux-career-change）のステップ1に、解説記事へのリンクカードを足す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279e-roadmap-add-article-link.ts            # DRY RUN
 *   npx tsx scripts/patch-279e-roadmap-add-article-link.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 「転職のゴール条件を確認して理解しよう」の先頭に入れる。すでに入っていれば何もしない。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const ROADMAP_ID = "oNWk1SXbyGbVYC4WgWISbP"; // roadmap: uiux-career-change
const GUIDE_ID = "webflow-guide-646484a2dec32f91e47f193c"; // guide: rdm-howtostart-roadmap
const ITEM_KEY = "step1sec1guide";
const STEP = "step1";
const SECTION = "step1sec1";
const FIRST = "step1sec1c1";

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

type Item = { _key: string; title?: string };
type Doc = {
  _id: string;
  _rev: string;
  steps?: Array<{ _key: string; sections?: Array<{ _key: string; contents?: Item[] }> }>;
};

async function main() {
  console.log(`dataset: ${client.config().dataset} / ${EXECUTE ? "EXECUTE（本番に書き込む）" : "DRY RUN"}\n`);
  const thumb = await client.fetch<string | null>(
    `*[_id == $id][0].content[_type == "image"][0].asset->url`,
    { id: GUIDE_ID }
  );
  if (!thumb) {
    console.error("⚠️ 記事の画像が見つかりません");
    process.exit(1);
  }
  const item = {
    _key: ITEM_KEY,
    _type: "externalLink",
    title: "転職ロードマップの詳しい解説",
    description: "目指すデザイナー像、採用で見せるアウトプット、各ステップの期間まで。始める前に全体像をつかめます。",
    url: "https://www.bo-no.design/guide/rdm-howtostart-roadmap",
    thumbnailUrl: `${thumb}?w=800&auto=format`,
  };
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id,_rev,steps}`, {
    ids: [ROADMAP_ID, `drafts.${ROADMAP_ID}`],
  });
  if (!docs.some((d) => d._id === ROADMAP_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);
    const contents = doc.steps?.find((s) => s._key === STEP)?.sections?.find((s) => s._key === SECTION)?.contents;
    if (!contents?.some((c) => c._key === FIRST)) {
      console.error("⚠️ 入れる場所が想定と違うので止めました");
      process.exit(1);
    }
    if (contents.some((c) => c._key === ITEM_KEY)) {
      console.log("  すでに入っています\n");
      continue;
    }
    console.log(`  今の並び: ${contents.map((c) => c.title).join(" / ")}`);
    console.log(`  先頭に足す: ${item.title}`);
    console.log(`  説明: ${item.description}`);
    console.log(`  リンク先: ${item.url}`);
    console.log(`  画像: ${item.thumbnailUrl}\n`);
    if (!EXECUTE) continue;
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .insert(
        "before",
        `steps[_key=="${STEP}"].sections[_key=="${SECTION}"].contents[_key=="${FIRST}"]`,
        [item]
      )
      .commit();
    console.log("  書き込み完了\n");
  }
  if (!EXECUTE) console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
