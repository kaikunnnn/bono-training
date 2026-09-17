/**
 * セクション4の3記事を production dataset に公開する。
 *
 * フェーズ1（デフォルト）: 画像アセットをアップロードし、3記事を published として createOrReplace。
 *   古い下書き（drafts.sbd-step4-*）を削除する。クエストは切り替えない（レッスンにはまだ出ない）。
 * フェーズ2（--switch-quest）: sbd-quest-step4 のタイトルと記事参照を新3記事に切り替え、
 *   sbd-step4-wip への参照を外す。コード（/materials・画像レンダラー修正）のデプロイ後に実行すること。
 *
 * 実行: npx tsx scripts/publish-scenario-section4-production.ts [--dry-run] [--switch-quest]
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";
import { createReadStream, readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const SWITCH_QUEST = process.argv.includes("--switch-quest");

const SRC_DIR =
  "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/ペルソナと課題でデザインするフロー/Step4-セクション4をどうするのか";

const ARTICLES = [
  {
    id: "sbd-step4-session4",
    title: "セッション4：次のデザインへつなげよう",
    file: "0. セッション4：次のデザインへつなげよう.md",
    articleType: "explain",
    articleNumber: 1,
    isPremium: false,
  },
  {
    id: "sbd-step4-1-one-page",
    title: "学びを検討ドキュメントにまとめよう",
    file: "1. 学びを検討ドキュメントにまとめよう.md",
    articleType: "practice",
    articleNumber: 2,
    isPremium: true,
  },
  {
    id: "sbd-step4-2-next-cycle",
    title: "トレーニングを完走しよう",
    file: "2.トレーニングを完走しよう.md",
    articleType: "practice",
    articleNumber: 3,
    isPremium: true,
  },
] as const;

// devデータセットのアセット参照 → productionへアップロードするローカルファイル
const IMAGE_SOURCES: Record<string, string> = {
  "image-d10b048d0c38a66fc9eafd06565e22e982d6dc59-1280x3869-png": "素材_完成例_全体.png",
  "image-c123fb7b31e3f0193e1b1bad145417951fc4359c-1280x2706-png": "素材_記事1作るもの_テンプレ.png",
  "image-060ada085eaff987bcb32f839e4297213e7b2c4a-1416x1608-png": "素材_記事1ポイント1_完成例の現在地.png",
};

const STALE_DRAFTS = [
  "drafts.sbd-step4-session4",
  "drafts.sbd-step4-1-one-page",
  "drafts.sbd-step4-2-next-cycle",
  "drafts.sbd-step4-materials-preview",
];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function key() {
  return crypto.randomBytes(6).toString("hex");
}

type Span = { _type: "span"; _key: string; marks: string[]; text: string };
type Block = {
  _type: string;
  _key: string;
  style?: string;
  markDefs?: unknown[];
  children?: Span[];
  level?: number;
  listItem?: "bullet" | "number";
  [k: string]: unknown;
};

function boldSpans(text: string): Span[] {
  const parts: Span[] = [];
  const strong = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(strong)) {
    const start = match.index as number;
    if (start > cursor) parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor, start) });
    parts.push({ _type: "span", _key: key(), marks: ["strong"], text: match[1] });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor) });
  return parts.length ? parts : [{ _type: "span", _key: key(), marks: [], text }];
}

function block(text: string, style = "normal", listItem?: "bullet" | "number"): Block {
  const markDefs: Array<{ _key: string; _type: "link"; href: string }> = [];
  const children: Span[] = [];
  const linkRe = /\[([^\]]+)\]\(((?:\/|https?:)[^\s)]+)\)/g;
  let cursor = 0;
  for (const m of text.matchAll(linkRe)) {
    const start = m.index as number;
    if (start > cursor) children.push(...boldSpans(text.slice(cursor, start)));
    const defKey = key();
    markDefs.push({ _key: defKey, _type: "link", href: m[2] });
    children.push({ _type: "span", _key: key(), marks: [defKey], text: m[1] });
    cursor = start + m[0].length;
  }
  if (cursor < text.length) children.push(...boldSpans(text.slice(cursor)));
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs,
    children: children.length ? children : boldSpans(text),
    ...(listItem ? { level: 1, listItem } : {}),
  };
}

function markdownToPortableText(raw: string, imageMap: Record<string, string>): Block[] {
  const lines = raw.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const titleIndex = lines.findIndex((line) => line.trim());
  if (titleIndex < 0 || !/^#\s+/.test(lines[titleIndex].trim())) {
    throw new Error("原稿の冒頭に記事タイトルのh1がありません");
  }
  lines.splice(titleIndex, 1);

  const result: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    const text = paragraph.join(" ").trim();
    if (text) result.push(block(text));
    paragraph = [];
  };

  for (const line of lines) {
    const text = line.trim();
    if (!text) {
      flush();
      continue;
    }
    const image = text.match(/^\[image:\s*(image-[a-z0-9-]+)\s*\]$/);
    if (image) {
      flush();
      const ref = imageMap[image[1]] || image[1];
      result.push({ _type: "image", _key: key(), asset: { _type: "reference", _ref: ref } });
      continue;
    }
    const linkcard = text.match(/^\[linkcard:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\]$/);
    if (linkcard) {
      flush();
      result.push({ _type: "linkCard", _key: key(), title: linkcard[1], description: linkcard[2], url: linkcard[3] });
      continue;
    }
    const heading = text.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flush();
      result.push(block(heading[2], `h${heading[1].length}`));
      continue;
    }
    const bullet = text.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flush();
      result.push(block(bullet[1], "normal", "bullet"));
      continue;
    }
    const number = text.match(/^\d+\.\s+(.+)$/);
    if (number) {
      flush();
      result.push(block(number[1], "normal", "number"));
      continue;
    }
    if (text.startsWith("> ")) {
      flush();
      result.push(block(text.slice(2), "blockquote"));
      continue;
    }
    paragraph.push(text);
  }
  flush();
  return result;
}

async function switchQuest() {
  const refs = ARTICLES.map(({ id }) => ({ _type: "reference", _ref: id, _key: key() }));
  console.log(JSON.stringify({ phase: "switch-quest", questId: "sbd-quest-step4", newTitle: "セクション4：一周をまとめて、次のデザインへつなげる", articles: ARTICLES.map((a) => a.id), dryRun: DRY_RUN }, null, 2));
  if (DRY_RUN) return;
  await client
    .patch("sbd-quest-step4")
    .set({ title: "セクション4：一周をまとめて、次のデザインへつなげる", articles: refs })
    .commit({ visibility: "sync" });
  await client.delete("drafts.sbd-quest-step4").catch(() => undefined);
  console.log("クエストを切り替えました");
}

async function publishArticles() {
  // 1. 画像アップロード（既存の同名アセットは Sanity 側で重複排除される）
  const imageMap: Record<string, string> = {};
  for (const [devRef, filename] of Object.entries(IMAGE_SOURCES)) {
    if (DRY_RUN) {
      imageMap[devRef] = `(dry-run: ${filename})`;
      continue;
    }
    const asset = await client.assets.upload("image", createReadStream(resolve(SRC_DIR, filename)), { filename });
    imageMap[devRef] = asset._id;
    console.log(`画像: ${filename} -> ${asset._id}`);
  }

  // 2. 記事を published として作成
  for (const article of ARTICLES) {
    const raw = readFileSync(resolve(SRC_DIR, article.file), "utf8");
    const content = markdownToPortableText(raw, imageMap);
    const doc = {
      _id: article.id,
      _type: "article",
      title: article.title,
      slug: { _type: "slug", current: article.id },
      articleType: article.articleType,
      articleNumber: article.articleNumber,
      author: "bono",
      isPremium: article.isPremium,
      publishedAt: "2026-09-17T00:00:00.000Z",
      content,
    };
    console.log(JSON.stringify({ id: article.id, title: article.title, isPremium: article.isPremium, blocks: content.length, headings: content.filter((b) => b.style?.startsWith?.("h")).map((b) => b.children?.map((c) => c.text).join("")) }, null, 2));
    if (!DRY_RUN) {
      await client.createOrReplace(doc as never);
      console.log(`公開しました: ${article.id}`);
    }
  }

  // 3. 古い下書きを削除
  for (const draftId of STALE_DRAFTS) {
    console.log(`${DRY_RUN ? "(dry-run) 削除予定" : "削除"}: ${draftId}`);
    if (!DRY_RUN) await client.delete(draftId).catch(() => undefined);
  }
}

async function main() {
  if (SWITCH_QUEST) {
    await switchQuest();
  } else {
    await publishArticles();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
