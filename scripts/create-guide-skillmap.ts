/**
 * Webflow 記事「ジュニアUI/UXデザイナーのためのスキルマップ」を
 * Sanity の guide（読み物）ドキュメントとして新規作成する。
 *
 * - 本文 HTML → Portable Text 変換
 *   - <h1>(章番号見出し) → style h2, <h2> → h2, <h3> → h3, <p> → normal
 *   - <br/> → テキスト内改行
 *   - <ol role="list"> / <ul role="list"> の <li> → listItem block(number/bullet, level:1)
 *   - <strong> → strong mark
 *   - 地の文の **太字** (Markdown風表記) → strong mark（** は除去）
 *   - <a href> → link annotation
 *   - <figure ...image> の <img> → image block（Sanity Assets へアップロード、URL 単位で dedupe）
 *   - 空段落（zero-width のみ / 空）はスキップ
 * - サムネイル画像も Sanity Assets へアップロード
 *
 * 実行:
 *   npx tsx scripts/create-guide-skillmap.ts --dry-run
 *   npx tsx scripts/create-guide-skillmap.ts
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

const HTML_PATH =
  "/private/tmp/claude-501/-Users-kaitakumi--superset-worktrees-BONO-fortunate-syrup/43c882bd-8b82-4054-b797-4668ea00b523/scratchpad/article_body.html";

const TARGET_SLUG = "uiuxdesigner-skillmap";
const THUMBNAIL_URL =
  "https://cdn.prod.website-files.com/6029d01deccd0a2530d2d878/64a7b6b0f10f10d6b6bc2219_thumbnail_skillmap2023.webp";

const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_PROJECT_ID ||
    "cqszh4up",
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    "production",
  apiVersion: "2024-01-01",
  token: writeToken,
  useCdn: false,
});

// ============================================
// 型
// ============================================

type SanityImageRef = { _type: "reference"; _ref: string };

type PtSpan = { _type: "span"; _key: string; marks: string[]; text: string };
type PtMarkDef = { _key: string; _type: string; href?: string };
type PtBlock = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: PtMarkDef[];
  children: PtSpan[];
  level?: number;
  listItem?: string;
};
type PtImage = {
  _type: "image";
  _key: string;
  asset: SanityImageRef;
  alt?: string;
  caption?: string;
};
type PtNode = PtBlock | PtImage;

// ============================================
// ユーティリティ
// ============================================

function randKey(len = 12): string {
  return crypto.randomBytes(len / 2).toString("hex");
}

const ZERO_WIDTH = /[​‌‍﻿]/g;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&"); // amp は最後（他の &xxx; を先に処理）
}

// URL -> assetRef のキャッシュ（同一画像の二重アップロード防止）
const imageCache = new Map<string, SanityImageRef>();

async function uploadImageFromUrl(url: string): Promise<SanityImageRef | null> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠️  画像取得失敗: ${res.status} ${url}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const cleanUrl = url.split("?")[0];
    const ext = cleanUrl.split(".").pop()?.toLowerCase() || "jpg";
    const asset = await client.assets.upload("image", buffer, {
      filename: `guide-skillmap-${randKey()}.${ext}`,
    });
    const ref: SanityImageRef = { _type: "reference", _ref: asset._id };
    imageCache.set(url, ref);
    return ref;
  } catch (e) {
    console.warn(`  ⚠️  画像アップロード失敗: ${e}`);
    return null;
  }
}

// ============================================
// インライン HTML → span[] + markDefs[]
// 対応: <strong>/<b>, <em>/<i>, <a href>, <br>, **太字**
// ============================================

function parseInlineHtml(htmlRaw: string): {
  spans: PtSpan[];
  markDefs: PtMarkDef[];
} {
  // <br> を改行に変換
  const html = htmlRaw.replace(/<br\s*\/?>/gi, "\n");

  const markDefs: PtMarkDef[] = [];
  const spans: PtSpan[] = [];

  type Marker = {
    kind: "open" | "close";
    tag: string;
    href?: string;
    pos: number;
    raw: string;
  };
  const markers: Marker[] = [];
  const tagRe = /<(\/?)(\w+)([^>]*)>/g;
  let mm: RegExpExecArray | null;
  while ((mm = tagRe.exec(html)) !== null) {
    const closing = mm[1] === "/";
    const tag = mm[2].toLowerCase();
    const attrs = mm[3];
    if (!["strong", "em", "b", "i", "a"].includes(tag)) continue;
    let href: string | undefined;
    if (!closing && tag === "a") {
      const hrefMatch = attrs.match(/href="([^"]+)"/);
      if (hrefMatch) href = decodeEntities(hrefMatch[1]);
    }
    markers.push({
      kind: closing ? "close" : "open",
      tag,
      href,
      pos: mm.index,
      raw: mm[0],
    });
  }

  const active: string[] = [];

  // active マークで text を span 化。**太字** を検出して分割する。
  const pushText = (raw: string) => {
    const text = decodeEntities(raw).replace(ZERO_WIDTH, "");
    if (!text) return;

    type Part = { t: string; bold: boolean };
    const parts: Part[] = [];
    const boldRe = /\*\*(.+?)\*\*/g;
    let idx = 0;
    let bm: RegExpExecArray | null;
    while ((bm = boldRe.exec(text)) !== null) {
      if (bm.index > idx)
        parts.push({ t: text.slice(idx, bm.index), bold: false });
      parts.push({ t: bm[1], bold: true });
      idx = bm.index + bm[0].length;
    }
    if (idx < text.length) parts.push({ t: text.slice(idx), bold: false });
    if (parts.length === 0) parts.push({ t: text, bold: false });

    for (const p of parts) {
      if (!p.t) continue;
      const marks = p.bold ? [...active, "strong"] : [...active];
      const uniq = [...new Set(marks)];
      spans.push({ _type: "span", _key: randKey(), marks: uniq, text: p.t });
    }
  };

  let cursor = 0;
  for (const m of markers) {
    if (m.pos > cursor) pushText(html.slice(cursor, m.pos));
    if (m.kind === "open") {
      if (m.tag === "strong" || m.tag === "b") active.push("strong");
      else if (m.tag === "em" || m.tag === "i") active.push("em");
      else if (m.tag === "a" && m.href) {
        const key = randKey();
        markDefs.push({ _key: key, _type: "link", href: m.href });
        active.push(key);
      }
    } else {
      const expected =
        m.tag === "strong" || m.tag === "b"
          ? "strong"
          : m.tag === "em" || m.tag === "i"
            ? "em"
            : null;
      if (expected) {
        const i = active.lastIndexOf(expected);
        if (i >= 0) active.splice(i, 1);
      } else if (m.tag === "a") {
        for (let i = active.length - 1; i >= 0; i--) {
          if (markDefs.some((d) => d._key === active[i])) {
            active.splice(i, 1);
            break;
          }
        }
      }
    }
    cursor = m.pos + m.raw.length;
  }
  if (cursor < html.length) pushText(html.slice(cursor));

  // 隣接する同一マークの span を結合
  const merged: PtSpan[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && JSON.stringify(last.marks) === JSON.stringify(s.marks)) {
      last.text += s.text;
    } else {
      merged.push({ ...s });
    }
  }
  return { spans: merged.filter((s) => s.text.length > 0), markDefs };
}

function makeBlock(
  innerHtml: string,
  style: string,
  listItem?: "number" | "bullet",
): PtBlock | null {
  // テキストが実質空ならスキップ
  const stripped = innerHtml
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(ZERO_WIDTH, "")
    .replace(/\s/g, "");
  if (!stripped) return null;

  const { spans, markDefs } = parseInlineHtml(innerHtml);
  if (spans.length === 0) return null;

  const block: PtBlock = {
    _type: "block",
    _key: randKey(),
    style,
    markDefs,
    children: spans,
  };
  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }
  return block;
}

// ============================================
// 本文 HTML → Portable Text
// ============================================

async function convert(html: string, dryRun: boolean): Promise<PtNode[]> {
  const out: PtNode[] = [];

  // トップレベル要素を出現順に走査
  const topRe = /<(h1|h2|h3|p|ol|ul|figure)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = topRe.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];

    if (tag === "figure") {
      const imgMatch = inner.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
      if (!imgMatch) continue;
      const src = decodeEntities(imgMatch[1]);
      const altMatch = inner.match(/<img[^>]*alt="([^"]*)"/i);
      const alt = altMatch ? altMatch[1] : "";

      console.log(`  📷 画像: ...${src.slice(-60)}`);
      if (dryRun) {
        const cached = imageCache.get(src);
        const ref: SanityImageRef = cached ?? {
          _type: "reference",
          _ref: `image-dry-${randKey()}`,
        };
        if (!cached) imageCache.set(src, ref);
        out.push({ _type: "image", _key: randKey(), asset: ref, alt, caption: "" });
      } else {
        const ref = await uploadImageFromUrl(src);
        if (ref) {
          out.push({ _type: "image", _key: randKey(), asset: ref, alt, caption: "" });
        }
      }
      continue;
    }

    if (tag === "ol" || tag === "ul") {
      const listItem = tag === "ol" ? "number" : "bullet";
      const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let lm: RegExpExecArray | null;
      while ((lm = liRe.exec(inner)) !== null) {
        const block = makeBlock(lm[1], "normal", listItem);
        if (block) out.push(block);
      }
      continue;
    }

    // 見出し / 段落
    const style =
      tag === "h1" ? "h2" : tag === "h2" ? "h2" : tag === "h3" ? "h3" : "normal";
    const block = makeBlock(inner, style);
    if (block) out.push(block);
  }

  return out;
}

// ============================================
// メイン
// ============================================

async function main() {
  console.log(`\n${DRY_RUN ? "🧪 DRY RUN" : "🚀 PRODUCTION"} - slug=${TARGET_SLUG}\n`);

  // 既存 guide 確認
  const exists = (await client.fetch(
    `*[_type == "guide" && slug.current == $slug][0]{ _id }`,
    { slug: TARGET_SLUG },
  )) as { _id: string } | null;
  if (exists && !DRY_RUN) {
    console.error(`⛔ 同じ slug の guide がすでに存在します: ${exists._id}`);
    process.exit(1);
  }

  const html = readFileSync(HTML_PATH, "utf-8");
  console.log(`HTML length: ${html.length}\n`);

  console.log("HTML → Portable Text 変換中...");
  const content = await convert(html, DRY_RUN);

  const blockCount = content.filter((b) => b._type === "block").length;
  const imageCount = content.filter((b) => b._type === "image").length;
  const listCount = content.filter(
    (b) => b._type === "block" && (b as PtBlock).listItem,
  ).length;

  // マーク集計
  let strongCount = 0;
  let linkCount = 0;
  const linkHrefs: string[] = [];
  const strongPreviews: string[] = [];
  for (const b of content) {
    if (b._type !== "block") continue;
    const blk = b as PtBlock;
    linkCount += blk.markDefs.filter((d) => d._type === "link").length;
    for (const d of blk.markDefs)
      if (d._type === "link" && d.href) linkHrefs.push(d.href);
    for (const s of blk.children) {
      if (s.marks.includes("strong")) {
        strongCount++;
        if (strongPreviews.length < 8)
          strongPreviews.push(s.text.slice(0, 40));
      }
    }
  }

  // 残留チェック
  const fullText = JSON.stringify(content);
  const starLeft = (fullText.match(/\*\*/g) || []).length;
  const singleStar = content
    .filter((b) => b._type === "block")
    .flatMap((b) => (b as PtBlock).children)
    .filter((s) => s.text.includes("*")).length;
  const brResidue = content
    .filter((b) => b._type === "block")
    .flatMap((b) => (b as PtBlock).children)
    .filter((s) => /<br|&lt;br|br\/&gt;/i.test(s.text)).length;

  console.log(`\n=== dry-run サマリー ===`);
  console.log(`総ブロック数: ${content.length}`);
  console.log(`  text block: ${blockCount}（うち listItem: ${listCount}）`);
  console.log(`  image block: ${imageCount}`);
  console.log(`ユニーク画像数: ${imageCache.size}`);
  console.log(`strong マーク付き span: ${strongCount}`);
  console.log(`link 数: ${linkCount}`);
  console.log(`\n--- link href 一覧 ---`);
  linkHrefs.forEach((h) => console.log(`  ${h}`));
  console.log(`\n--- strong span プレビュー（先頭8件） ---`);
  strongPreviews.forEach((t) => console.log(`  "${t}"`));

  console.log(`\n--- 残留チェック ---`);
  console.log(`本文中の "**" 残留: ${starLeft} 件 ${starLeft === 0 ? "✅" : "⛔"}`);
  console.log(`"*" を含む span: ${singleStar} 件 ${singleStar === 0 ? "✅" : "⚠️"}`);
  console.log(`br タグ由来の生テキスト残留: ${brResidue} 件 ${brResidue === 0 ? "✅" : "⛔"}`);

  console.log(`\n--- ブロック並び順 ---`);
  content.forEach((b, i) => {
    if (b._type === "image") {
      console.log(`[${i}] image  ref=${(b as PtImage).asset._ref}`);
    } else {
      const blk = b as PtBlock;
      const preview = blk.children.map((c) => c.text).join("").slice(0, 44);
      const li = blk.listItem ? `(${blk.listItem}) ` : "";
      console.log(`[${i}] ${blk.style} ${li}"${preview}"`);
    }
  });

  const description =
    "現場に入ったジュニアUI/UXデザイナーがどう成長していくべきかを整理した記事。デザイナーが貢献する3つのタイプとスキルマップの全体像、まず身につけるべき基礎スキルと目指したい状態、そしてBONOが目指す方向性までを解説します。";

  if (DRY_RUN) {
    console.log(`\n🧪 dry-run のため書き込みは行いません。`);
    return;
  }

  // サムネイルアップロード
  console.log(`\n📷 サムネイルアップロード中...`);
  const thumbRef = await uploadImageFromUrl(THUMBNAIL_URL);
  console.log(`  asset: ${thumbRef?._ref ?? "失敗"}`);

  const guideDoc = {
    _type: "guide",
    title: "ジュニアUI/UXデザイナーのためのスキルマップ - 貢献領域と成長の道筋",
    slug: { _type: "slug", current: TARGET_SLUG },
    category: "career",
    description,
    author: "BONO",
    isPremium: false,
    publishedAt: "2023-08-23T00:00:00Z",
    thumbnail: thumbRef
      ? { _type: "image", asset: thumbRef }
      : undefined,
    content,
  };

  console.log(`\n💾 Sanity に投入中...`);
  const created = await client.create(guideDoc);
  console.log(`\n✅ 作成完了: _id=${created._id}`);
  console.log(`   slug: ${TARGET_SLUG}`);
  console.log(`   URL: /guide/${TARGET_SLUG}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
