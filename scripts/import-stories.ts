/**
 * lesson "dezainanokiyaria" 配下の article を Story にインポートする。
 *
 * 流れ:
 *   1. 対象 23 件を取得
 *   2. 各記事の Webflow URL から publishedAt を curl で取得
 *   3. タイトル＋slug から person.name を抽出
 *   4. Sanity に story document を作成（既存なら更新）
 *
 * 実行: npx tsx scripts/import-stories.ts [--dry-run]
 *
 * Sanity への書き込みには SANITY_WRITE_TOKEN が必要。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const LESSON_SLUG = "dezainanokiyaria";
const WEBFLOW_BASE = "https://www.bo-no.design/contents";
const WEBFLOW_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

const EXCLUDE_TITLE_PATTERNS = [
  "未経験からフリーランスUIデザイナーになるステップ",
  "Webデザインの価値を上げる方法",
  "ビジュアルが良くても採用が通過されない理由",
  "デザインで仕事を得られるスキル基準",
  "資産化",
  "デザイナーの相場",
  "デザイナーが自分に合う会社を見分ける方法",
  "ファーストキャリアはデザイン組織化された会社",
  "ほぼラジオ",
];

const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です（.env.local を確認）");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: writeToken,
  useCdn: false,
});

interface ArticleSource {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  _createdAt: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  thumbnail?: { asset?: { _ref?: string } };
  thumbnailUrl?: string;
  content?: unknown[]; // PortableText
}

/**
 * Webflow CMS API から全アイテムを取得し slug → lastPublished のマップを返す
 */
async function fetchWebflowPublishedMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}` } }
    );
    if (!res.ok) {
      console.error(`Webflow API error: ${res.status}`);
      break;
    }
    const data: {
      items: Array<{ lastPublished?: string | null; createdOn?: string; fieldData?: { slug?: string } }>;
      pagination?: { total?: number };
    } = await res.json();

    for (const item of data.items) {
      const slug = item.fieldData?.slug;
      if (!slug) continue;
      const publishedAt = item.lastPublished || item.createdOn;
      if (publishedAt) map.set(slug, publishedAt);
    }

    offset += limit;
    if (offset >= (data.pagination?.total ?? 0)) break;
    // レート制限対策で少し待つ
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`Webflow から ${map.size} 件の slug→publishedAt マップ取得\n`);
  return map;
}

/**
 * 外部URLから画像をダウンロードして Sanity にアップロード
 * 返り値は image type のオブジェクト
 */
async function uploadImageFromUrl(
  url: string
): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
    const asset = await client.assets.upload("image", buffer, {
      filename: `story-hero.${ext}`,
    });
    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch {
    return null;
  }
}

/**
 * タイトル+slug から person.name を抽出
 * 優先順:
 *   1. タイトル中の「〇〇さん」「〇〇くん」
 *   2. slug の末尾（youhadouyate...{name}({数字|-copy})?）
 *   3. フォールバック「BONO受講者」
 */
function extractPersonName(title: string, slug: string): string {
  // 1. タイトルから「〜さん」「〜くん」
  //    （日本語名・カタカナ・ローマ字に対応）
  const honorificMatch = title.match(/([ぁ-んァ-ヶー一-龯a-zA-Z0-9]+?)(さん|くん)/);
  if (honorificMatch) return `${honorificMatch[1]}${honorificMatch[2]}`;

  // 2. slug の末尾
  //    例: youhadouyatedezainani-nakano → nakano
  //    例: youhadouyatedezainanihanzo-copy → hanzo
  //    例: youhadouyatedesigner-rinneru01 → rinneru
  //    例: youhadouyatedesigner-yanashi-01 → yanashi
  //    例: youhadouyatedezainanimegu → megu
  //    例: howareyoubecomethedesigner-genta → genta
  const slugClean = slug
    .replace(/-?(copy|0?\d+)$/i, "")
    .replace(
      /^(youhadouyatedezainani|youhadouyatedesigner|howareyoubecomethedesigner|howtobedesigner)/i,
      ""
    );
  const slugMatch = slugClean.match(/-?([a-z]+)$/i);
  if (slugMatch && slugMatch[1].length >= 2) {
    const name = slugMatch[1];
    return name.charAt(0).toUpperCase() + name.slice(1) + "さん";
  }

  return "BONO受講者";
}

/**
 * title からカテゴリラベル相当のタグを推定（軸1: 経験背景）
 * 「未経験」を含むなら「未経験」、それ以外は「業界経験あり」をデフォルト
 */
function guessTag(title: string): string {
  if (title.includes("未経験")) return "未経験";
  return "業界経験あり";
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE (Sanity に書き込みます)"}\n`);

  // 1. 対象記事取得
  const articles: ArticleSource[] = await client.fetch(
    `
    *[_type == "article" && quest->lesson->slug.current == $lessonSlug]
    | order(_createdAt asc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      _createdAt,
      excerpt,
      tags,
      author,
      thumbnail,
      thumbnailUrl,
      content
    }
  `,
    { lessonSlug: LESSON_SLUG }
  );

  const included = articles.filter(
    (a) => !EXCLUDE_TITLE_PATTERNS.some((p) => a.title.includes(p))
  );

  console.log(`対象 ${included.length}件 / 全 ${articles.length}件\n`);

  // Webflow から公開日マップ取得
  const webflowMap = await fetchWebflowPublishedMap();

  let success = 0;
  let failed = 0;

  for (const [i, a] of included.entries()) {
    const idx = `[${i + 1}/${included.length}]`;

    // 公開日取得（Webflow → _createdAt）
    const publishedAt = webflowMap.get(a.slug) || a._createdAt;

    // 人名抽出
    const personName = extractPersonName(a.title, a.slug);

    // タグ
    const tag = guessTag(a.title);

    // excerpt（160字制限）
    const excerpt = (a.excerpt || a.title).slice(0, 160);

    // heroImage:
    //   - article.thumbnail.asset._ref があればそれを使う（Sanity 内画像）
    //   - なければ thumbnailUrl から画像をダウンロード → Sanity にアップロード
    let heroImage:
      | { _type: "image"; asset: { _type: "reference"; _ref: string } }
      | null = null;

    if (a.thumbnail?.asset?._ref) {
      heroImage = {
        _type: "image",
        asset: { _type: "reference", _ref: a.thumbnail.asset._ref },
      };
    } else if (a.thumbnailUrl && !DRY_RUN) {
      heroImage = await uploadImageFromUrl(a.thumbnailUrl);
    }

    const storyDoc = {
      _id: `story-${a.slug}`,
      _type: "story",
      title: a.title,
      slug: { _type: "slug", current: a.slug },
      publishedAt,
      excerpt,
      heroImage,
      person: {
        name: personName,
      },
      category: "uiux_career_change",
      tags: [tag],
      body: a.content || [],
    };

    console.log(`${idx} ${a.title.slice(0, 50)}...`);
    console.log(`     slug: ${a.slug}`);
    console.log(`     publishedAt: ${publishedAt.slice(0, 10)} (${a.slug})`);
    console.log(`     person: ${personName}, tag: #${tag}`);
    console.log(`     heroImage: ${heroImage ? "✓ Sanity asset" : DRY_RUN ? "(dry-run: thumbnailUrl=" + (a.thumbnailUrl ? "あり→アップロード予定" : "なし") + ")" : "✗ アップロード失敗"}`);

    if (DRY_RUN) {
      console.log("     ⏭ DRY RUN: スキップ\n");
      continue;
    }

    try {
      // createOrReplace で上書きインポート
      await client.createOrReplace(storyDoc);
      console.log(`     ✅ インポート成功\n`);
      success++;
    } catch (err) {
      console.error(`     ❌ 失敗: ${err}\n`);
      failed++;
    }
  }

  console.log(`\n=== 完了 ===`);
  console.log(`成功: ${success} / 失敗: ${failed} / 全 ${included.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
