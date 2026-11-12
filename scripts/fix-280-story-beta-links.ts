/**
 * #280 ストーリー3本に残っている bono-training.vercel.app 宛てのリンクを www.bo-no.design に直す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/fix-280-story-beta-links.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/fix-280-story-beta-links.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 対象（2026-11-10 公開中の文書を確認。下書きはなし）:
 *   - wake: /lessons/three-structures-ui-design
 *   - sobo-selfregi-uiux-dai / dokugaku-kangaete-tsukuru-graphic-uiux-koji: /roadmap/uiux-career-change
 * パスはそのまま、ドメインだけ置き換える。ストーリー以外の11件は対象外（別 issue）。
 *
 * .env.local はこのファイルの1つ上（リポジトリ直下）を読み、無ければ main のチェックアウトを読む。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const localEnv = resolve(__dirname, "..", ".env.local");
config({
  path: existsSync(localEnv)
    ? localEnv
    : "/Users/kaitakumi/Documents/bono-training/.env.local",
});

const EXECUTE = process.argv.includes("--execute");
const OLD = "https://bono-training.vercel.app";
const NEW = "https://www.bo-no.design";

if (EXECUTE && !process.env.SANITY_WRITE_TOKEN) {
  console.error("⚠️ SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId: "cqszh4up",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const TARGETS = [
  {
    id: "QhqcW30okFB4gGu0dhjeph",
    slug: "wake",
    path: 'body[_key=="708d096d2362"].markDefs[_key=="d5421cf2ef6c"].href',
  },
  {
    id: "dai-story-howtobedesigner",
    slug: "sobo-selfregi-uiux-dai",
    path: 'body[_key=="cf2db8b49434"].content[_key=="87749d5eac69"].markDefs[_key=="a791113247a9"].href',
  },
  {
    id: "koji-story-graphic-to-uiux",
    slug: "dokugaku-kangaete-tsukuru-graphic-uiux-koji",
    path: 'body[_key=="5f592b7f4145"].content[_key=="87749d5eac69"].markDefs[_key=="a791113247a9"].href',
  },
];

async function main() {
  console.log(EXECUTE ? "=== 本番に書き込みます ===" : "=== DRY RUN（読むだけ） ===");
  const tx = client.transaction();
  let count = 0;

  for (const t of TARGETS) {
    // キー指定のパスは GROQ では入れ子の配列で返るので、平らにして文字列を1つ取り出す
    const raw: unknown = await client.fetch(`*[_id == $id][0].${t.path}`, { id: t.id });
    const found = [raw].flat(Infinity).filter((v): v is string => typeof v === "string");
    const current = found.length === 1 ? found[0] : null;
    if (!current || !current.startsWith(OLD)) {
      console.log(`- ${t.slug}: 対象のリンクが見つからない／直し済み（${current ?? "なし"}）→ スキップ`);
      continue;
    }
    const next = NEW + current.slice(OLD.length);
    console.log(`- ${t.slug}\n    前: ${current}\n    後: ${next}`);
    tx.patch(t.id, (p) => p.set({ [t.path]: next }));
    count++;
  }

  if (!EXECUTE) {
    console.log(`\n${count} 件を直します。書き込むには --execute を付けて実行してください。`);
    return;
  }
  if (count === 0) return;
  await tx.commit();
  console.log(`\n✅ ${count} 件を書き込みました`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
