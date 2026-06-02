/**
 * Webflow の 1記事 (slug 指定) を Sanity の story として投入する。
 * - 本文 (description-3 / HTML) → Portable Text に変換
 * - 本文中の <img> と heroImage は Sanity Assets にアップロード
 *
 * 実行:
 *   npx tsx scripts/import-webflow-story.ts --slug=youhadouyatedezainani-wake --dry-run
 *   npx tsx scripts/import-webflow-story.ts --slug=youhadouyatedezainani-wake
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const REPLACE = args.includes("--replace"); // 既存 story を上書き更新
const slugArg = args.find((a) => a.startsWith("--slug="));
const TARGET_SLUG = slugArg ? slugArg.split("=")[1] : "youhadouyatedezainani-wake";
const personArg = args.find((a) => a.startsWith("--person="));
const PERSON_OVERRIDE = personArg ? personArg.split("=")[1] : null;

const WEBFLOW_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN =
  process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
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
// ユーティリティ
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
      filename: `story-${randKey()}.${ext}`,
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
// HTML → Portable Text 変換
// ============================================

/**
 * インライン HTML 文字列を span[] + markDefs[] に変換する。
 * 対応タグ: <strong>, <em>, <a href="...">
 */
function parseInlineHtml(html: string): { spans: PtSpan[]; markDefs: PtMarkDef[] } {
  const markDefs: PtMarkDef[] = [];
  const spans: PtSpan[] = [];

  // タグを境界として走査
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

  // marker を順に処理して活性マークを管理
  const active: string[] = []; // span に付ける marks（"strong"/"em" or markDef key）
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
      // close: 直近の対応する mark を取り除く
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
        // markDef の key を最後尾から取り除く（最後に push した markDef key を想定）
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

  // 隣り合う同じマークの span を結合
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

function inlineHtmlToBlock(html: string, style: string): PtBlock | null {
  // 中身のテキストが空（&zwj; や空白のみ）ならスキップ
  const stripped = html.replace(/<[^>]+>/g, "").replace(/[\s​-‍﻿‍]/g, "");
  if (!stripped) return null;
  const { spans, markDefs } = parseInlineHtml(html);
  if (spans.length === 0) return null;
  return {
    _type: "block",
    _key: randKey(),
    style,
    markDefs,
    children: spans,
  };
}

/**
 * Webflow の HTML (description-3) を Portable Text 配列に変換する。
 * <figure><div><img></div><figcaption>...</figcaption></figure> を image ブロックに、
 * <p>, <h2>, <h3> を block に変換する。
 */
async function htmlToPortableText(html: string, dryRun: boolean): Promise<PtNode[]> {
  const out: PtNode[] = [];

  // figure 単位で本文を分割
  const figureRe = /<figure[^>]*>[\s\S]*?<\/figure>/g;
  let lastIndex = 0;
  const figureMatches: { match: RegExpExecArray; full: string }[] = [];
  let fm: RegExpExecArray | null;
  while ((fm = figureRe.exec(html)) !== null) {
    figureMatches.push({ match: fm, full: fm[0] });
  }

  const processTextSegment = (segment: string) => {
    // <p>, <h2>, <h3>, <h4> ブロック単位で抽出
    const blockRe = /<(p|h[1-6])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
    let bm: RegExpExecArray | null;
    while ((bm = blockRe.exec(segment)) !== null) {
      const tag = bm[1].toLowerCase();
      const inner = bm[2];
      // Webflow の編集中メモ「[🖼️ サムネにする画像を貼る]」等をスキップ
      const plain = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
      if (/^\[[🖼📷📌🚧✏️].*\]$/.test(plain) || /サムネにする画像を貼る/.test(plain)) {
        continue;
      }
      const style = tag === "p" ? "normal" : `h${Math.min(parseInt(tag.slice(1)), 4)}`;
      const block = inlineHtmlToBlock(inner, style);
      if (block) out.push(block);
    }
  };

  for (const f of figureMatches) {
    // figure より前のテキスト
    if (f.match.index > lastIndex) {
      processTextSegment(html.slice(lastIndex, f.match.index));
    }
    // figure の中身（画像 + caption）
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
      // figcaption に <a> がある場合、その情報を保持するため image ブロックの直後に
      // インラインリンク含む段落を追加する
      if (captionHasLink) {
        const linkBlock = inlineHtmlToBlock(captionRaw, "normal");
        if (linkBlock) out.push(linkBlock);
      }
    }
    lastIndex = f.match.index + f.full.length;
  }
  // 残り
  if (lastIndex < html.length) {
    processTextSegment(html.slice(lastIndex));
  }
  return out;
}

// ============================================
// メイン
// ============================================

async function fetchWebflowItem(slug: string) {
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}` } }
    );
    const data: {
      items: Array<{
        id: string;
        lastPublished?: string | null;
        createdOn?: string;
        fieldData: Record<string, unknown> & { slug?: string };
      }>;
      pagination?: { total?: number };
    } = await res.json();
    for (const item of data.items) {
      if (item.fieldData.slug === slug) return item;
    }
    offset += limit;
    if (offset >= (data.pagination?.total ?? 0)) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

function extractPersonName(title: string, slug: string, bodyHtml: string): string {
  // 1) タイトルに「〜さん/くん」があれば最優先
  const fromTitle = title.match(/([ぁ-んァ-ヶー一-龯a-zA-Z0-9]+?)(さん|くん)/);
  if (fromTitle) return `${fromTitle[1]}${fromTitle[2]}`;

  // 2) 本文 HTML 内の <strong>〜さん/くん</strong> を探す（インタビュー記事は話者が <strong> で囲まれる）
  const strongRe = /<strong[^>]*>([^<]+?)(さん|くん)<\/strong>/g;
  const speakers: Record<string, number> = {};
  let m: RegExpExecArray | null;
  while ((m = strongRe.exec(bodyHtml)) !== null) {
    const name = `${m[1]}${m[2]}`;
    speakers[name] = (speakers[name] || 0) + 1;
  }
  // カイクン以外で最頻出のもの = インタビュイー
  const intervieweeEntry = Object.entries(speakers)
    .filter(([name]) => !/カイクン|kaikun|カイ君/i.test(name))
    .sort((a, b) => b[1] - a[1])[0];
  if (intervieweeEntry) return intervieweeEntry[0];

  // 3) slug 末尾フォールバック
  const slugClean = slug
    .replace(/-?(copy|0?\d+)$/i, "")
    .replace(
      /^(youhadouyatedezainani|youhadouyatedesigner|howareyoubecomethedesigner|howtobedesigner)/i,
      ""
    );
  const sm = slugClean.match(/-?([a-z]+)$/i);
  if (sm && sm[1].length >= 2) {
    return sm[1].charAt(0).toUpperCase() + sm[1].slice(1) + "さん";
  }
  return "BONO受講者";
}

function guessTag(title: string): string {
  if (title.includes("未経験")) return "未経験";
  return "業界経験あり";
}

async function main() {
  console.log(`\n${DRY_RUN ? "🧪 DRY RUN" : "🚀 PRODUCTION"} - slug=${TARGET_SLUG}\n`);

  // 既存 story 確認
  const exists = (await client.fetch(
    `*[_type == "story" && slug.current == $slug][0]{ _id }`,
    { slug: TARGET_SLUG }
  )) as { _id: string } | null;
  if (exists && !DRY_RUN && !REPLACE) {
    console.error(`⛔ 同じ slug の story がすでに存在します: ${exists._id}`);
    console.error("   既存を上書きする場合は --replace を付けてください");
    process.exit(1);
  }
  if (exists && REPLACE) {
    console.log(`ℹ️  既存 story (${exists._id}) を上書きします\n`);
  }

  // Webflow Item 取得
  console.log("Webflow Item を検索中...");
  const item = await fetchWebflowItem(TARGET_SLUG);
  if (!item) {
    console.error("⛔ Webflow Item が見つかりません");
    process.exit(1);
  }

  const fd = item.fieldData;
  const title = (fd.videotitle as string) || (fd.name as string) || "";
  const excerpt = ((fd["search-description"] as string) || "").slice(0, 160);
  const html = (fd["description-3"] as string) || "";
  const publishedAt =
    (item.lastPublished as string | undefined) ||
    (item.createdOn as string | undefined) ||
    new Date().toISOString();
  const thumbObj = fd["video-thumbnail"] as { url?: string } | null;
  const thumbnailUrl = thumbObj?.url;

  console.log(`title: ${title}`);
  console.log(`publishedAt: ${publishedAt}`);
  console.log(`html length: ${html.length}`);
  console.log(`thumbnail: ${thumbnailUrl || "(なし)"}`);
  console.log();

  // 本文 HTML → Portable Text
  console.log("HTML → Portable Text 変換中...");
  const body = await htmlToPortableText(html, DRY_RUN);
  const imageCount = body.filter((b) => b._type === "image").length;
  const blockCount = body.filter((b) => b._type === "block").length;
  console.log(`  ブロック数: ${blockCount}, 画像数: ${imageCount}\n`);

  // heroImage アップロード
  let heroImage: SanityImageRef | null = null;
  if (thumbnailUrl) {
    if (DRY_RUN) {
      console.log("📷 heroImage: (dry-run スキップ)");
      heroImage = { _type: "image", asset: { _type: "reference", _ref: "dry-hero" } };
    } else {
      console.log("📷 heroImage アップロード中...");
      heroImage = await uploadImageFromUrl(thumbnailUrl);
      console.log(`  asset: ${heroImage?.asset._ref ?? "失敗"}`);
    }
  }

  const personName = PERSON_OVERRIDE || extractPersonName(title, TARGET_SLUG, html);
  const tag = guessTag(title);

  console.log(`\n--- メタデータ ---`);
  console.log(`person.name: ${personName}`);
  console.log(`tag: #${tag}`);
  console.log(`excerpt: ${excerpt}`);

  const storyDoc = {
    _type: "story",
    title,
    slug: { _type: "slug", current: TARGET_SLUG },
    publishedAt,
    excerpt,
    heroImage,
    person: { name: personName },
    category: "uiux_career_change",
    tags: [tag],
    body,
  };

  if (DRY_RUN) {
    console.log("\n--- Story doc プレビュー（body は省略） ---");
    console.log(
      JSON.stringify(
        {
          ...storyDoc,
          body: `[${blockCount} blocks + ${imageCount} images]`,
        },
        null,
        2
      )
    );
    console.log("\n--- body block types in order ---");
    body.forEach((b, i) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bb = b as any;
      if (b._type === "image") {
        console.log(`[${i}] image  alt="${bb.alt ?? ""}"  caption="${bb.caption ?? ""}"`);
      } else {
        const preview = (bb.children ?? []).map((c: { text?: string }) => c.text || "").join("").slice(0, 40);
        console.log(`[${i}] ${bb.style}  "${preview}"`);
      }
    });
    return;
  }

  console.log("\n💾 Sanity に投入中...");
  if (exists && REPLACE) {
    // 既存ドキュメントを置き換え（_id を保持して、heroImage と body を更新）
    const patched = await client
      .patch(exists._id)
      .set({
        title: storyDoc.title,
        publishedAt: storyDoc.publishedAt,
        excerpt: storyDoc.excerpt,
        heroImage: storyDoc.heroImage,
        person: storyDoc.person,
        category: storyDoc.category,
        tags: storyDoc.tags,
        body: storyDoc.body,
      })
      .commit();
    console.log(`\n✅ 更新完了: _id=${patched._id}`);
  } else {
    const created = await client.create(storyDoc);
    console.log(`\n✅ 投入完了: _id=${created._id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
