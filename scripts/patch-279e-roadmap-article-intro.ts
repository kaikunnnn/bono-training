/**
 * rebono 279-E 転職ロードマップ解説記事の冒頭を調整し、リンクカードにOGP画像を足す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279e-roadmap-article-intro.ts            # DRY RUN
 *   npx tsx scripts/patch-279e-roadmap-article-intro.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 変えるもの: サムネイル（OGP画像を兼ねる）、タイトル、冒頭の文章、見出し2つ、最初のカードの説明文、リンクカード8枚の画像
 * 今の文章が想定と違う場合は書き込まずに止まる。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { createReadStream, existsSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "webflow-guide-646484a2dec32f91e47f193c"; // guide: rdm-howtostart-roadmap
const CDN = "https://cdn.sanity.io/images/cqszh4up/production/";
const OGP: Record<string, string> = {
  "/roadmap/uiux-career-change": "ca248fc614e5d1ba755cbafd56ab3671d61c3499-1440x780.webp",
  "/roadmap/ui-design-beginner": "3a3e4dcfb2dd1396d5ad00cdd9f35a97193bad78-1440x780.webp",
  "/roadmap/ui-visual": "fa2678332c9a7151133e8e6823ccdceacb7171f2-1440x780.webp",
  "/roadmap/information-architecture": "f4bb78bd16049b0e3f1604b5e7cd7f6adf2623ee-1440x780.webp",
  "/roadmap/ux-design-basic": "a20f5b6fc960f6f0cbc9f171d303a38ed8924e6f-1440x780.webp",
};

type Node = {
  _key: string;
  _type: string;
  style?: string;
  url?: string;
  description?: string;
  imageUrl?: string;
  children?: Array<{ _key?: string; _type?: string; text?: string; marks?: string[] }>;
};
const textOf = (n: Node) => (n.children ?? []).map((c) => c.text ?? "").join("");

// 今の文の書き出し → 新しい文（null は削除）
const CHANGES: Array<[string, string | null]> = [
  ["こんにちは、カイクンです。", "こんにちは、カイクンです。🙋\nUI/UXデザイナー13年目、BONOでこれまで約60人の転職を導いてきました。この記事では、AI時代に未経験からUI/UXデザイナーへ転職するためのロードマップを紹介します。"],
  ["UI/UXデザイナーの仕事は、サービスをデザインする仕事", "デジタルプロダクトを自ら作るUI/UXデザイナーを目指そう！"],
  ["UI/UXデザイナーは、Webサービスやソフトウェアを設計する仕事です。", "UI/UXデザイナーは、Webサービスやソフトウェアを設計する仕事です。見た目やUIを作るだけではありません。ユーザーやビジネスから考えはじめて、課題を解決するデジタル体験や仕組みを設計します。"],
  ["そのために、「なぜこの流れや見た目であるべきか？」", null],
  ["この記事では、AI時代に対応して、", "未経験からでも1年で、転職できるスキルを身につける。そのために何をどの順番でやるのかを、具体的に解説します💡"],
  ["何から勉強すればいいか迷っている人や、", "何から勉強すればいいか迷っている人や、AIがあるのに今からデザインを学ぶ意味があるのか気になっている人に、読んでほしい記事です。また、現場でつくるだけのデザイナーになっている人にも、身につけるスキルの参考になれば幸いです。"],
  ["この記事は、全体像と考え方をまとめたものです。", "この記事で全体像と考え方をつかんだら、実際のレッスンは転職ロードマップから順番に進められます。"],
  ["1年後に目指すデザイナー像", "このロードマップで目指すUI/UXデザイナー像"],
];
const THUMBNAIL_FILE = resolve(
  process.env.HOME ?? "",
  "Documents/01_BONO事業/01_Docs/rebono/issues/279-E-A_記事の全体イメージ_正式版/images/thumbnail.jpg"
);
const TITLE_AFTER = "未経験からUI/UXデザイナーへ転職するロードマップ｜AI時代に1年で身につけるスキル";
const FIRST_CARD_DESCRIPTION = "ステップごとのレッスンを、順番どおりに進められるページです。";

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
  if (!existsSync(THUMBNAIL_FILE)) {
    console.error(`⚠️ サムネイルが見つかりません: ${THUMBNAIL_FILE}`);
    process.exit(1);
  }
  console.log(`サムネイル: ${THUMBNAIL_FILE}\n`);
  const docs = await client.fetch<Array<{ _id: string; _rev: string; title: string; content: Node[] }>>(
    `*[_id in $ids]{_id,_rev,title,content}`,
    { ids: [DOC_ID, `drafts.${DOC_ID}`] }
  );
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);
    console.log(`  タイトル 今:   ${doc.title}`);
    console.log(`  タイトル 直後: ${TITLE_AFTER}\n`);
    let content = [...doc.content];
    for (const [start, after] of CHANGES) {
      const i = content.findIndex((n) => n._type === "block" && textOf(n).startsWith(start));
      if (i < 0) {
        console.error(`⚠️ 想定の文が見つかりません: ${start}`);
        process.exit(1);
      }
      console.log(`  今:   ${textOf(content[i]).slice(0, 60)}`);
      console.log(`  直後: ${after === null ? "（削除）" : after.slice(0, 60)}\n`);
      if (after === null) {
        content = content.filter((_, k) => k !== i);
      } else {
        const n = content[i];
        content[i] = {
          ...n,
          children: [{ _key: `${n._key}-s0`, _type: "span", text: after, marks: [] }],
        };
      }
    }
    let first = true;
    content = content.map((n) => {
      if (n._type !== "linkCard") return n;
      const path = new URL(n.url as string).pathname;
      const file = OGP[path];
      if (!file) {
        console.error(`⚠️ OGP画像がありません: ${path}`);
        process.exit(1);
      }
      const card = { ...n, imageUrl: `${CDN}${file}?w=480&auto=format&q=80` };
      if (first) {
        first = false;
        console.log(`  最初のカードの説明: ${n.description} → ${FIRST_CARD_DESCRIPTION}`);
        card.description = FIRST_CARD_DESCRIPTION;
      }
      console.log(`  カード画像: ${path}`);
      return card;
    });
    console.log(`\n  本文 ${doc.content.length} → ${content.length} ブロック\n`);
    if (!EXECUTE) continue;
    const asset = await client.assets.upload("image", createReadStream(THUMBNAIL_FILE), {
      filename: "279e-thumbnail.jpg",
    });
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({
        title: TITLE_AFTER,
        content,
        thumbnail: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      })
      .commit();
    console.log("  書き込み完了\n");
  }
  if (!EXECUTE) console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
