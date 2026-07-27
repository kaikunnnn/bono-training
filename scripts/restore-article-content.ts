/**
 * Webflow から移行できていない article.content（本文 / Portable Text）を復旧する。
 *
 * 背景: 初期インポート `scripts/webflow-import/import.ts` の L148 で
 *   `content: [], // Empty content for now`
 * とハードコードされたため、「UIビジュアル基礎」レッスン配下の記事は本文が空のまま。
 * Webflow Videos コレクション（6029d027f6cb8852cbce8c75）の `fieldData["description-3"]`
 * が元の HTML 本文。slug 完全一致で突合し、Portable Text に変換して patch する。
 *
 * HTML → Portable Text 変換ロジックは `scripts/import-webflow-story.ts` からコピー（流用）。
 *
 * 実行例:
 *   # 突合サマリ + 全件 dry-run（書き込みなし）
 *   npx tsx scripts/restore-article-content.ts
 *   # 突合結果だけ見る（変換プレビューを省略）
 *   npx tsx scripts/restore-article-content.ts --audit
 *   # 特定 slug だけ dry-run
 *   npx tsx scripts/restore-article-content.ts --slug=uivisual-xxxx
 *   # 特定 slug だけ本番書き込み（1件確認フロー）
 *   npx tsx scripts/restore-article-content.ts --slug=uivisual-xxxx --execute
 *   # 別レッスンに横展開
 *   npx tsx scripts/restore-article-content.ts --lesson-id=xxxx
 *
 * 安全策:
 *   - デフォルトは dry-run。`--execute` を明示したときだけ書き込む。
 *   - 書き込み対象は「現在 content が空の記事」のみ（patch 直前に再確認）。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

// ============================================
// 引数
// ============================================

const args = process.argv.slice(2);
const AUDIT_ONLY = args.includes("--audit");
const EXECUTE = args.includes("--execute");
const slugArg = args.find((a) => a.startsWith("--slug="));
const TARGET_SLUG = slugArg ? slugArg.split("=")[1] : null;
const lessonArg = args.find((a) => a.startsWith("--lesson-id="));
const LESSON_ID = lessonArg ? lessonArg.split("=")[1] : "g4rl1HmkpTXIsvYhaK3Ukl";

const WEBFLOW_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN =
  process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

const projectId =
  process.env.SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.VITE_SANITY_PROJECT_ID ||
  "cqszh4up";
const dataset =
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.VITE_SANITY_DATASET ||
  "production";
const writeToken = process.env.SANITY_WRITE_TOKEN;

if (!writeToken && EXECUTE) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です（--execute 時）");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token: writeToken,
  useCdn: false,
});

// ============================================
// 型
// ============================================

type SanityImageRef = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

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
  asset: { _type: "reference"; _ref: string };
  alt?: string;
  caption?: string;
};

type PtNode = PtBlock | PtImage;

// ============================================
// ユーティリティ（import-webflow-story.ts からコピー）
// ============================================

function randKey(len = 12): string {
  return crypto.randomBytes(len / 2).toString("hex");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

async function uploadImageFromUrl(url: string): Promise<SanityImageRef | null> {
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
      filename: `article-${randKey()}.${ext}`,
    });
    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (e) {
    console.warn(`  ⚠️  画像アップロード失敗: ${e}`);
    return null;
  }
}

// ============================================
// HTML → Portable Text 変換（import-webflow-story.ts からコピー）
// ============================================

/**
 * インライン HTML 文字列を span[] + markDefs[] に変換する。
 * 対応タグ: <strong>, <em>, <b>, <i>, <a href="...">
 */
function parseInlineHtml(html: string): { spans: PtSpan[]; markDefs: PtMarkDef[] } {
  const markDefs: PtMarkDef[] = [];
  const spans: PtSpan[] = [];

  type Marker = { kind: "open" | "close"; tag: string; href?: string; pos: number; raw: string };
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
      if (hrefMatch) href = hrefMatch[1];
    }
    markers.push({ kind: closing ? "close" : "open", tag, href, pos: mm.index, raw: mm[0] });
  }

  const active: string[] = [];
  let cursor = 0;

  const pushText = (raw: string) => {
    const text = decodeEntities(raw).replace(/[​-‍﻿]/g, "");
    if (!text) return;
    spans.push({
      _type: "span",
      _key: randKey(),
      marks: [...active],
      text,
    });
  };

  for (const m of markers) {
    if (m.pos > cursor) {
      pushText(html.slice(cursor, m.pos));
    }
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
        const idx = active.lastIndexOf(expected);
        if (idx >= 0) active.splice(idx, 1);
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

  const merged: PtSpan[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && JSON.stringify(last.marks) === JSON.stringify(s.marks)) {
      last.text += s.text;
    } else {
      merged.push(s);
    }
  }
  return { spans: merged.filter((s) => s.text.length > 0), markDefs };
}

function inlineHtmlToBlock(
  html: string,
  style: string,
  extra?: { listItem?: string; level?: number }
): PtBlock | null {
  // <br> はインライン改行として \n に正規化する（コピー元は <br> を文字列のまま残していた）。
  // 一部レッスンの本文はエンティティ化された &lt;br&gt; で保存されており、これを先に潰しておかないと
  // decodeEntities で「<br>」という文字列にデコードされ本文中に残ってしまうため、両形式を \n にする。
  html = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&lt;br\s*\/?&gt;/gi, "\n");
  const stripped = html.replace(/<[^>]+>/g, "").replace(/[\s​-‍﻿]/g, "");
  if (!stripped) return null;
  const { spans, markDefs } = parseInlineHtml(html);
  if (spans.length === 0) return null;
  const block: PtBlock = {
    _type: "block",
    _key: randKey(),
    style,
    markDefs,
    children: spans,
  };
  if (extra?.listItem) block.listItem = extra.listItem;
  if (extra?.level) block.level = extra.level;
  return block;
}

/**
 * Webflow の HTML (description-3) を Portable Text 配列に変換する。
 * <figure><div><img></div><figcaption>...</figcaption></figure> を image ブロックに、
 * <p>, <h2>, <h3>, <h4> を block に変換する。
 *
 * ※ import-webflow-story.ts の processTextSegment を拡張し、<ul>/<ol> の <li> を
 *   listItem 付き block（bullet / number）として拾えるようにした（レッスン記事は箇条書きが多いため）。
 *   <blockquote> も blockquote スタイルの block として拾う。
 */
async function htmlToPortableText(html: string, dryRun: boolean): Promise<PtNode[]> {
  const out: PtNode[] = [];

  const figureRe = /<figure[^>]*>[\s\S]*?<\/figure>/g;
  let lastIndex = 0;
  const figureMatches: { match: RegExpExecArray; full: string }[] = [];
  let fm: RegExpExecArray | null;
  while ((fm = figureRe.exec(html)) !== null) {
    figureMatches.push({ match: fm, full: fm[0] });
  }

  const isEditorNote = (inner: string): boolean => {
    const plain = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
    return /^\[[🖼📷📌🚧✏️].*\]$/.test(plain) || /サムネにする画像を貼る/.test(plain);
  };

  const processTextSegment = (segment: string) => {
    // <p>, <h1-6>, <ul>, <ol>, <blockquote> をトップレベル・ブロックとして順に走査
    const blockRe = /<(p|h[1-6]|ul|ol|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
    let bm: RegExpExecArray | null;
    while ((bm = blockRe.exec(segment)) !== null) {
      const tag = bm[1].toLowerCase();
      const inner = bm[2];

      if (tag === "ul" || tag === "ol") {
        const listItem = tag === "ul" ? "bullet" : "number";
        const liRe = /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g;
        let lm: RegExpExecArray | null;
        while ((lm = liRe.exec(inner)) !== null) {
          if (isEditorNote(lm[1])) continue;
          const block = inlineHtmlToBlock(lm[1], "normal", { listItem, level: 1 });
          if (block) out.push(block);
        }
        continue;
      }

      if (tag === "blockquote") {
        // blockquote 内の <p> があれば各段落を、無ければ中身全体を blockquote スタイルで
        const innerPRe = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g;
        let pm: RegExpExecArray | null;
        let matched = false;
        while ((pm = innerPRe.exec(inner)) !== null) {
          matched = true;
          if (isEditorNote(pm[1])) continue;
          const block = inlineHtmlToBlock(pm[1], "blockquote");
          if (block) out.push(block);
        }
        if (!matched && !isEditorNote(inner)) {
          const block = inlineHtmlToBlock(inner, "blockquote");
          if (block) out.push(block);
        }
        continue;
      }

      // p / h1-6
      if (isEditorNote(inner)) continue;
      const style = tag === "p" ? "normal" : `h${Math.min(parseInt(tag.slice(1)), 4)}`;
      const block = inlineHtmlToBlock(inner, style);
      if (block) out.push(block);
    }
  };

  for (const f of figureMatches) {
    if (f.match.index > lastIndex) {
      processTextSegment(html.slice(lastIndex, f.match.index));
    }
    const imgMatch = f.full.match(/<img[^>]*src="([^"]+)"[^>]*>/);
    const captionRawMatch = f.full.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/);
    const captionRaw = captionRawMatch ? captionRawMatch[1] : "";
    const captionPlain = decodeEntities(captionRaw.replace(/<[^>]+>/g, "")).trim();
    const captionHasLink = /<a\s[^>]*href=/i.test(captionRaw);
    const altMatch = f.full.match(/<img[^>]*alt="([^"]*)"/);
    if (imgMatch) {
      const src = imgMatch[1];
      const alt = altMatch ? altMatch[1] : undefined;
      const altClean = alt && alt !== "__wf_reserved_inherit" ? alt : captionPlain || undefined;

      console.log(`  📷 画像: ${src.slice(0, 80)}...`);
      if (dryRun) {
        out.push({
          _type: "image",
          _key: randKey(),
          asset: { _type: "reference", _ref: `dry-${randKey()}` },
          alt: altClean,
          caption: captionPlain || undefined,
        });
      } else {
        const uploaded = await uploadImageFromUrl(src);
        if (uploaded) {
          out.push({
            _type: "image",
            _key: randKey(),
            asset: uploaded.asset,
            alt: altClean,
            caption: captionPlain || undefined,
          });
        }
      }
      if (captionHasLink) {
        const linkBlock = inlineHtmlToBlock(captionRaw, "normal");
        if (linkBlock) out.push(linkBlock);
      }
    }
    lastIndex = f.match.index + f.full.length;
  }
  if (lastIndex < html.length) {
    processTextSegment(html.slice(lastIndex));
  }
  return out;
}

// ============================================
// 未対応タグ検出（データ確認用）
// ============================================

const WATCHED_TAGS = ["ul", "ol", "li", "blockquote", "table", "iframe", "pre", "code", "img", "figure", "p", "h2", "h3", "h4"];

function scanTags(html: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tag of WATCHED_TAGS) {
    const re = new RegExp(`<${tag}\\b`, "gi");
    const n = (html.match(re) || []).length;
    if (n > 0) counts[tag] = n;
  }
  return counts;
}

// ============================================
// Webflow 全件取得
// ============================================

type WebflowFieldData = Record<string, unknown> & { slug?: string; "description-3"?: string };

async function fetchAllWebflowVideos(): Promise<Map<string, WebflowFieldData>> {
  const map = new Map<string, WebflowFieldData>();
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}`, accept: "application/json" } }
    );
    if (!res.ok) {
      throw new Error(`Webflow API error (${res.status}): ${await res.text()}`);
    }
    const data: {
      items: Array<{ id: string; fieldData: WebflowFieldData }>;
      pagination?: { total?: number };
    } = await res.json();
    for (const item of data.items) {
      const slug = item.fieldData?.slug;
      if (slug) map.set(slug, item.fieldData);
    }
    offset += limit;
    if (data.items.length < limit || offset >= (data.pagination?.total ?? 0)) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return map;
}

// ============================================
// メイン
// ============================================

type TargetArticle = { _id: string; title: string; slug: string; blockCount: number | null };

async function main() {
  console.log(
    `\n${EXECUTE ? "🚀 PRODUCTION（書き込み）" : "🧪 DRY RUN（書き込みなし）"} — lesson-id=${LESSON_ID}${
      TARGET_SLUG ? ` slug=${TARGET_SLUG}` : ""
    }\n`
  );

  // 1. 対象レッスン配下の記事を全件取得（content の有無も取得）
  const allArticles = (await client.fetch(
    `*[_type == "article" && quest->lesson._ref == $lessonId]{
      _id, title, "slug": slug.current, "blockCount": count(content)
    } | order(slug asc)`,
    { lessonId: LESSON_ID }
  )) as TargetArticle[];

  const emptyArticles = allArticles.filter((a) => !a.blockCount || a.blockCount === 0);
  const filledArticles = allArticles.filter((a) => a.blockCount && a.blockCount > 0);

  console.log(`📚 レッスン配下の記事: ${allArticles.length}件`);
  console.log(`   ├─ content 空: ${emptyArticles.length}件（復旧対象）`);
  console.log(`   └─ content あり: ${filledArticles.length}件（対象外・触らない）\n`);

  if (allArticles.length === 0) {
    console.error("⛔ 記事が0件です。lesson-id または参照チェーンを確認してください。");
    process.exit(1);
  }

  // 2. Webflow 全件取得 → slug Map
  console.log("Webflow Videos を全件取得中...");
  const webflowMap = await fetchAllWebflowVideos();
  console.log(`   → Webflow item: ${webflowMap.size}件（slug 保有）\n`);

  // 3. 突合（空 content 記事のみ対象）
  let scope = emptyArticles;
  if (TARGET_SLUG) {
    scope = scope.filter((a) => a.slug === TARGET_SLUG);
    if (scope.length === 0) {
      console.error(`⛔ slug=${TARGET_SLUG} は「content 空の対象記事」に含まれません。`);
      const inAll = allArticles.find((a) => a.slug === TARGET_SLUG);
      if (inAll) console.error(`   （この記事は既に content=${inAll.blockCount}ブロックあり。上書きしません）`);
      process.exit(1);
    }
  }

  const matched: { art: TargetArticle; fd: WebflowFieldData; html: string }[] = [];
  const noWebflow: TargetArticle[] = [];
  const emptyDesc: TargetArticle[] = [];

  for (const art of scope) {
    const fd = webflowMap.get(art.slug);
    if (!fd) {
      noWebflow.push(art);
      continue;
    }
    const html = ((fd["description-3"] as string) || "").trim();
    if (!html) {
      emptyDesc.push(art);
      continue;
    }
    matched.push({ art, fd, html });
  }

  console.log("=== 突合結果 ===");
  console.log(`  ✅ 一致（本文あり）        : ${matched.length}件`);
  console.log(`  ⚠️  Webflowに該当slugなし   : ${noWebflow.length}件`);
  console.log(`  ⚠️  一致したが本文が空       : ${emptyDesc.length}件`);

  if (noWebflow.length > 0) {
    console.log("\n  [Webflowに該当slugなし]");
    for (const a of noWebflow) console.log(`    - ${a.slug}  「${a.title}」`);
  }
  if (emptyDesc.length > 0) {
    console.log("\n  [description-3 が空]");
    for (const a of emptyDesc) console.log(`    - ${a.slug}  「${a.title}」`);
  }

  // 4. 未対応タグの棚卸し（一致した記事のみ）
  const tagTotals: Record<string, number> = {};
  const articlesWithLists: string[] = [];
  const articlesWithExotic: string[] = [];
  for (const { art, html } of matched) {
    const tags = scanTags(html);
    for (const [t, n] of Object.entries(tags)) tagTotals[t] = (tagTotals[t] || 0) + n;
    if (tags.ul || tags.ol || tags.li) articlesWithLists.push(art.slug);
    if (tags.table || tags.iframe || tags.pre) articlesWithExotic.push(art.slug);
  }
  console.log("\n=== HTMLタグ棚卸し（一致記事の合計）===");
  console.log(
    "  " +
      WATCHED_TAGS.filter((t) => tagTotals[t])
        .map((t) => `${t}=${tagTotals[t]}`)
        .join("  ")
  );
  if (articlesWithLists.length > 0) {
    console.log(`  📝 リスト(ul/ol/li)を含む記事: ${articlesWithLists.length}件 → listItem block に変換`);
  }
  if (articlesWithExotic.length > 0) {
    console.log(`  ⚠️  table/iframe/pre を含む記事（未対応・要検討）: ${articlesWithExotic.length}件`);
    for (const s of articlesWithExotic) console.log(`     - ${s}`);
  }

  if (AUDIT_ONLY) {
    console.log("\n(--audit のためここで終了。変換プレビューは行いません)");
    return;
  }

  // 5. dry-run / execute 本体
  console.log(`\n${"=".repeat(60)}`);
  console.log(EXECUTE ? "本番書き込みを開始します" : "dry-run 変換プレビュー");
  console.log("=".repeat(60));

  let totalBlocks = 0;
  let totalImages = 0;
  const lowBlock: { slug: string; blocks: number; htmlLen: number }[] = [];
  const patched: string[] = [];
  const skipped: string[] = [];
  const failed: { slug: string; error: string }[] = [];

  for (const { art, html } of matched) {
    console.log(`\n── ${art.slug} 「${art.title}」`);
    console.log(`   HTML長: ${html.length}`);

    let body: PtNode[];
    try {
      body = await htmlToPortableText(html, !EXECUTE);
    } catch (e) {
      console.error(`   ⛔ 変換失敗: ${e}`);
      failed.push({ slug: art.slug, error: String(e) });
      continue;
    }

    const blockCount = body.filter((b) => b._type === "block").length;
    const imageCount = body.filter((b) => b._type === "image").length;
    totalBlocks += blockCount;
    totalImages += imageCount;
    console.log(`   → ブロック ${blockCount} / 画像 ${imageCount}`);

    if (blockCount + imageCount <= 1 && html.length > 200) {
      lowBlock.push({ slug: art.slug, blocks: blockCount + imageCount, htmlLen: html.length });
    }

    // 先頭数ブロックのプレビュー
    body.slice(0, 4).forEach((b, i) => {
      if (b._type === "image") {
        console.log(`     [${i}] image  alt="${b.alt ?? ""}"`);
      } else {
        const bb = b as PtBlock;
        const preview = (bb.children ?? []).map((c) => c.text || "").join("").slice(0, 50);
        const li = bb.listItem ? `(${bb.listItem})` : "";
        console.log(`     [${i}] ${bb.style}${li}  "${preview}"`);
      }
    });

    if (!EXECUTE) continue;

    // === 本番書き込み: patch 直前に「今も空か」を再確認（安全ガード）===
    const fresh = (await client.fetch(
      `*[_type == "article" && _id == $id][0]{ "blockCount": count(content) }`,
      { id: art._id }
    )) as { blockCount: number | null } | null;
    if (fresh && fresh.blockCount && fresh.blockCount > 0) {
      console.warn(`   ⏭️  スキップ: content が既に ${fresh.blockCount} ブロックあります（上書きしません）`);
      skipped.push(art.slug);
      continue;
    }
    if (body.length === 0) {
      console.warn(`   ⏭️  スキップ: 変換結果が0ブロック（要調査）`);
      skipped.push(art.slug);
      continue;
    }

    try {
      await client.patch(art._id).set({ content: body }).commit();
      console.log(`   ✅ 書き込み完了: ${art._id}`);
      patched.push(art.slug);
    } catch (e) {
      console.error(`   ⛔ 書き込み失敗: ${e}`);
      failed.push({ slug: art.slug, error: String(e) });
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  // 6. サマリ
  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 サマリ");
  console.log("=".repeat(60));
  console.log(`  対象（一致・本文あり）: ${matched.length}件`);
  console.log(`  総ブロック数: ${totalBlocks} / 総画像数: ${totalImages}`);
  if (lowBlock.length > 0) {
    console.log(`  ⚠️  変換結果が極端に少ない記事（要確認）: ${lowBlock.length}件`);
    for (const l of lowBlock) console.log(`     - ${l.slug}  block+img=${l.blocks}  htmlLen=${l.htmlLen}`);
  }
  if (EXECUTE) {
    console.log(`  ✅ 書き込み成功: ${patched.length}件`);
    if (skipped.length > 0) console.log(`  ⏭️  スキップ: ${skipped.length}件 → ${skipped.join(", ")}`);
    if (failed.length > 0) {
      console.log(`  ⛔ 失敗: ${failed.length}件`);
      for (const f of failed) console.log(`     - ${f.slug}: ${f.error}`);
    }
    console.log(`\n  patched _id/slug: ${patched.join(", ")}`);
  } else {
    console.log("\n  （dry-run。実際に書き込むには --execute を付けてください）");
  }
}

// このファイルを直接実行したときだけ main() を走らせる（テスト/検証からの import を許可するため）
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { htmlToPortableText, inlineHtmlToBlock, parseInlineHtml, decodeEntities };
