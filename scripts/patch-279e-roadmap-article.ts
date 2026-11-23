/**
 * rebono 279-E 転職ロードマップ解説記事（/guide/rdm-howtostart-roadmap）を正式版に差し替える（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279e-roadmap-article.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279e-roadmap-article.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * ⚠️ PR #308（縦長の画像の表示）が本番に出てから実行すること。先に書くと全体の計画の図が小さく表示される。
 *
 * 変えるもの: title / description / publishedAt / content（全置換）
 * 今の値が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 * 元に戻すときの元データ: rebono/issues/279-E-A_本番記事のバックアップ_2026-11-07.json
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { createReadStream, existsSync, readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "webflow-guide-646484a2dec32f91e47f193c"; // guide: rdm-howtostart-roadmap
const EXPECTED_REV = "r5DNWLrex3QVNSpw633Ij3";

const TITLE_AFTER = "未経験からUI/UXデザイナーへ転職するロードマップ。プロが考えるスキル習得の流れ";
const DESCRIPTION_AFTER =
  "未経験からUI/UXデザイナーに転職するロードマップを、現役デザイナーが解説。AI時代に必要なスキル、1年の学習ステップと期間、採用で見せるポートフォリオまで、何をどの順番で学ぶかがわかります。";

const IMAGE_DIR = resolve(
  process.env.HOME ?? "",
  "Documents/01_BONO事業/01_Docs/rebono/issues/279-E-A_記事の全体イメージ_正式版/images"
);

type Node = {
  _key: string;
  _type: string;
  style?: string;
  listItem?: string;
  file?: string;
  alt?: string;
  title?: string;
  url?: string;
  children?: Array<{ text: string; marks: string[] }>;
  markDefs?: Array<{ href: string }>;
};

const nodes: Node[] = JSON.parse(
  readFileSync(resolve(__dirname, "data/279e-roadmap-article.json"), "utf-8")
);

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

const textOf = (n: Node) => (n.children ?? []).map((c) => c.text).join("");

async function main() {
  console.log(`dataset: ${client.config().dataset} / ${EXECUTE ? "EXECUTE（本番に書き込む）" : "DRY RUN"}\n`);

  const docs = await client.fetch<
    Array<{ _id: string; _rev: string; title: string; description?: string; publishedAt?: string; n: number }>
  >(`*[_id in $ids]{_id,_rev,title,description,publishedAt,"n":count(content)}`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  const published = docs.find((d) => d._id === DOC_ID);
  if (!published) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  const files = [...new Set(nodes.filter((n) => n._type === "image").map((n) => n.file as string))];
  const missing = files.filter((f) => !existsSync(resolve(IMAGE_DIR, f)));

  for (const d of docs) {
    console.log(`■ ${d._id}（本文 ${d.n} ブロック / rev ${d._rev}）`);
    console.log(`  title 今:   ${d.title}\n  title 直後: ${TITLE_AFTER}`);
    console.log(`  description 今:   ${d.description}\n  description 直後: ${DESCRIPTION_AFTER}`);
    console.log(`  publishedAt 今: ${d.publishedAt} → 実行した日時\n`);
  }

  console.log(`■ 新しい本文: ${nodes.length} ブロック（画像 ${files.length} 枚 / リンクカード ${nodes.filter((n) => n._type === "linkCard").length} 枚）\n`);
  for (const n of nodes) {
    if (n.style && /^h[234]$/.test(n.style)) console.log(`${"  ".repeat(Number(n.style[1]) - 2)}${n.style} ${textOf(n)}`);
    else if (n._type === "image") console.log(`    [画像] ${n.file}`);
    else if (n._type === "linkCard") console.log(`    [カード] ${n.title} → ${n.url}`);
  }
  const links = nodes.flatMap((n) => (n.markDefs ?? []).map((m) => m.href));
  console.log(`\n本文内リンク ${links.length} 本`);
  if (missing.length) console.error(`⚠️ 画像が見つかりません: ${missing.join(", ")}`);

  const revOk = published._rev === EXPECTED_REV;
  if (!revOk) console.error(`⚠️ 記事が想定の版と違います（今 ${published._rev}）。Studio で誰かが直していないか確認してください`);
  if (!revOk || missing.length) process.exit(1);

  if (!EXECUTE) {
    console.log("\nDRY RUN のため書き込んでいません。--execute で本番に書き込みます");
    return;
  }

  const assetIds: Record<string, string> = {};
  for (const f of files) {
    const asset = await client.assets.upload("image", createReadStream(resolve(IMAGE_DIR, f)), { filename: `279e-${f}` });
    assetIds[f] = asset._id;
    console.log(`画像アップロード: ${f}`);
  }
  const content = nodes.map(({ file, ...n }) =>
    n._type === "image"
      ? { ...n, asset: { _type: "reference", _ref: assetIds[file as string] } }
      : n
  );
  const publishedAt = new Date().toISOString();
  for (const d of docs) {
    await client
      .patch(d._id)
      .ifRevisionId(d._rev)
      .set({ title: TITLE_AFTER, description: DESCRIPTION_AFTER, publishedAt, content })
      .commit();
    console.log(`書き込み完了: ${d._id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
