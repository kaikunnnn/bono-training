/**
 * ガイド記事インポートスクリプト
 *
 * アノテーション付きマークダウンをSanity Portable Textに変換し、
 * ガイドドキュメントとして作成/更新する。
 *
 * 実行: cd sanity-studio && npx tsx scripts/importGuide.ts <マークダウンファイルパス>
 *
 * マークダウンアノテーション構文:
 *   <!-- sectionHeading number="01" label="WHY" -->
 *   <!-- cardGrid variant="stat" columns="3" --> ... <!-- end -->
 *   <!-- pullQuote text="..." attribution="..." variant="highlight" -->
 *   <!-- stepFlow --> ... <!-- end -->
 *   <!-- divider label="次のステップ" -->
 *   :::tip タイトル ... :::
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { marked } from "marked";
import { JSDOM } from "jsdom";

dotenv.config({ path: ".env.local" });

const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});
// フロントエンドはproductionを参照するため、dataset不一致を警告
if (dataset !== "production") {
  console.warn(`⚠️  データセット: ${dataset}（フロントエンドはproductionを参照）`);
}

// ── ユーティリティ ──

function generateKey(): string {
  return Math.random().toString(36).substring(2, 14);
}

// ── フロントマター解析 ──

interface Frontmatter {
  title: string;
  slug: string;
  category: string;
  description: string;
  isPremium?: boolean;
  tags?: string[];
  author?: string;
  readingTime?: string;
}

function parseFrontmatter(markdown: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  // CRLF → LF に正規化
  const normalized = markdown.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(
      "フロントマターが見つかりません。---で囲んでください。"
    );
  }

  const yamlStr = match[1];
  const body = match[2];

  const frontmatter: Record<string, any> = {};
  for (const line of yamlStr.split("\n")) {
    // key: value 形式をパース（値にコロンを含むURLにも対応）
    const kv = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (kv) {
      const [, key, rawValue] = kv;
      let value: any = rawValue.trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((s: string) => s.trim().replace(/^["']|["']$/g, ""));
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      } else {
        value = value.replace(/^["']|["']$/g, "");
      }

      frontmatter[key] = value;
    }
  }

  if (!frontmatter.title || !frontmatter.slug || !frontmatter.category) {
    throw new Error(
      "フロントマターに title, slug, category が必要です。"
    );
  }

  return { frontmatter: frontmatter as Frontmatter, body };
}

// ── アノテーション解析 ──

interface AnnotationToken {
  type: string;
  attrs: Record<string, string>;
  children?: AnnotationToken[];
  position: number; // 元テキスト内の位置
}

function parseAttrs(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = regex.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

/**
 * アノテーションコメントを抽出し、プレースホルダーに置換
 */
function extractAnnotations(body: string): {
  tokens: AnnotationToken[];
  cleaned: string;
} {
  const tokens: AnnotationToken[] = [];
  let cleaned = body;
  let placeholderIndex = 0;

  // 1. コンテナブロック: <!-- cardGrid ... --> ... <!-- end -->
  //    子要素: <!-- card ... --> や <!-- step ... -->
  const containerRegex =
    /<!--\s*(cardGrid|stepFlow)\s*(.*?)-->([\s\S]*?)<!--\s*end\s*-->/g;
  cleaned = cleaned.replace(containerRegex, (_match, type, attrs, innerBlock) => {
    const token: AnnotationToken = {
      type,
      attrs: parseAttrs(attrs),
      children: [],
      position: placeholderIndex,
    };

    // 子要素を抽出
    const childType = type === "cardGrid" ? "card" : "step";
    const childRegex = new RegExp(
      `<!--\\s*${childType}\\s+(.*?)-->`,
      "g"
    );
    let cm;
    while ((cm = childRegex.exec(innerBlock)) !== null) {
      token.children!.push({
        type: childType,
        attrs: parseAttrs(cm[1]),
        position: 0,
      });
    }

    tokens.push(token);
    const placeholder = `\n\nBLOCKANNOTATION${placeholderIndex}ENDBLOCK\n\n`;
    placeholderIndex++;
    return placeholder;
  });

  // 2. スタンドアロンブロック: <!-- sectionHeading ... -->, <!-- pullQuote ... -->, <!-- divider ... -->
  const standaloneRegex =
    /<!--\s*(sectionHeading|pullQuote|divider)\s*(.*?)-->/g;
  cleaned = cleaned.replace(standaloneRegex, (_match, type, attrs) => {
    tokens.push({
      type,
      attrs: parseAttrs(attrs),
      position: placeholderIndex,
    });
    const placeholder = `\n\nBLOCKANNOTATION${placeholderIndex}ENDBLOCK\n\n`;
    placeholderIndex++;
    return placeholder;
  });

  // 3. カスタムコンテナ: :::type タイトル ... :::
  const containerSyntaxRegex =
    /^:::(tip|info|warning|danger|note)(?:\s+(.+))?\n([\s\S]*?)^:::/gm;
  cleaned = cleaned.replace(
    containerSyntaxRegex,
    (_match, cType, title, content) => {
      tokens.push({
        type: "customContainer",
        attrs: { containerType: cType, title: title?.trim() || "", content: content.trim() },
        position: placeholderIndex,
      });
      const placeholder = `\n\nBLOCKANNOTATION${placeholderIndex}ENDBLOCK\n\n`;
      placeholderIndex++;
      return placeholder;
    }
  );

  return { tokens, cleaned };
}

// ── マークダウン → Portable Text 変換 ──

function htmlToPortableText(html: string): any[] {
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  const doc = dom.window.document;
  const body = doc.querySelector("body")!;
  const blocks: any[] = [];

  for (const node of Array.from(body.childNodes)) {
    const converted = convertNode(node as Element);
    if (converted) {
      if (Array.isArray(converted)) {
        blocks.push(...converted);
      } else {
        blocks.push(converted);
      }
    }
  }

  return blocks;
}

function convertNode(node: Node): any | any[] | null {
  if (node.nodeType === 3) {
    const text = node.textContent?.trim();
    if (!text) return null;
    return createBlock("normal", [{ _type: "span", _key: generateKey(), text, marks: [] }]);
  }

  if (node.nodeType !== 1) return null;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  const placeholderMatch = tag === "p" ? el.textContent?.match(/^BLOCKANNOTATION(\d+)ENDBLOCK$/) : null;
  if (placeholderMatch) {
    return { _type: "__placeholder__", _index: parseInt(placeholderMatch[1]) };
  }

  // 見出し
  if (["h1", "h2", "h3", "h4"].includes(tag)) {
    const { spans, markDefs } = extractSpans(el);
    return createBlock(tag, spans, markDefs);
  }

  // 段落
  if (tag === "p") {
    const { spans, markDefs } = extractSpans(el);
    if (spans.length === 0) return null;
    return createBlock("normal", spans, markDefs);
  }

  // ブロッククオート
  if (tag === "blockquote") {
    const innerP = el.querySelector("p");
    const { spans, markDefs } = extractSpans(innerP || el);
    return createBlock("blockquote", spans, markDefs);
  }

  // リスト
  if (tag === "ul" || tag === "ol") {
    const listType = tag === "ul" ? "bullet" : "number";
    const items: any[] = [];
    for (const li of Array.from(el.querySelectorAll(":scope > li"))) {
      const { spans, markDefs } = extractSpans(li);
      items.push({
        _type: "block",
        _key: generateKey(),
        style: "normal",
        listItem: listType,
        level: 1,
        markDefs,
        children: spans.length > 0 ? spans : [{ _type: "span", _key: generateKey(), text: "", marks: [] }],
      });
    }
    return items;
  }

  // テーブル
  if (tag === "table") {
    return convertTable(el);
  }

  // 画像
  if (tag === "img") {
    return {
      _type: "image",
      _key: generateKey(),
      alt: el.getAttribute("alt") || "",
      caption: el.getAttribute("title") || "",
      // 外部URLの場合はasset参照ではなくURLを保持
      _sanityAsset: `image@${el.getAttribute("src")}`,
    };
  }

  // figure (画像のラッパー)
  if (tag === "figure") {
    const img = el.querySelector("img");
    const figcaption = el.querySelector("figcaption");
    if (img) {
      return {
        _type: "image",
        _key: generateKey(),
        alt: img.getAttribute("alt") || "",
        caption: figcaption?.textContent || img.getAttribute("title") || "",
        _sanityAsset: `image@${img.getAttribute("src")}`,
      };
    }
  }

  return null;
}

function extractSpans(el: Element | Node): { spans: any[]; markDefs: any[] } {
  const spans: any[] = [];
  const markDefs: any[] = [];

  function walk(node: Node, marks: string[]) {
    if (node.nodeType === 3) {
      const text = node.textContent || "";
      if (text) {
        spans.push({
          _type: "span",
          _key: generateKey(),
          text,
          marks: [...marks],
        });
      }
      return;
    }

    if (node.nodeType !== 1) return;
    const child = node as Element;
    const tag = child.tagName.toLowerCase();

    let newMarks = [...marks];

    if (tag === "strong" || tag === "b") {
      newMarks.push("strong");
    } else if (tag === "em" || tag === "i") {
      newMarks.push("em");
    } else if (tag === "code") {
      newMarks.push("code");
    } else if (tag === "a") {
      const key = generateKey();
      markDefs.push({
        _type: "link",
        _key: key,
        href: child.getAttribute("href") || "",
      });
      newMarks.push(key);
    }

    for (const c of Array.from(child.childNodes)) {
      walk(c, newMarks);
    }
  }

  walk(el, []);

  return { spans, markDefs };
}

function createBlock(style: string, children: any[], markDefs: any[] = []): any {
  return {
    _type: "block",
    _key: generateKey(),
    style,
    markDefs,
    children:
      children.length > 0
        ? children
        : [{ _type: "span", _key: generateKey(), text: "", marks: [] }],
  };
}

function convertTable(el: Element): any {
  const rows: any[] = [];

  // thead
  const thead = el.querySelector("thead");
  if (thead) {
    for (const tr of Array.from(thead.querySelectorAll("tr"))) {
      const cells = Array.from(tr.querySelectorAll("th, td")).map(
        (td) => td.textContent?.trim() || ""
      );
      rows.push({
        _key: generateKey(),
        isHeader: true,
        cells,
      });
    }
  }

  // tbody
  const tbody = el.querySelector("tbody") || el;
  for (const tr of Array.from(tbody.querySelectorAll(":scope > tr"))) {
    // theadの行は除外
    if (tr.parentElement?.tagName.toLowerCase() === "thead") continue;
    const cells = Array.from(tr.querySelectorAll("th, td")).map(
      (td) => td.textContent?.trim() || ""
    );
    rows.push({
      _key: generateKey(),
      isHeader: false,
      cells,
    });
  }

  return {
    _type: "tableBlock",
    _key: generateKey(),
    rows,
  };
}

// ── アノテーション → Sanityオブジェクト変換 ──

function annotationToSanityObject(token: AnnotationToken): any {
  const { type, attrs, children } = token;

  switch (type) {
    case "sectionHeading":
      return {
        _type: "sectionHeading",
        _key: generateKey(),
        number: attrs.number || "01",
        label: attrs.label || "",
        title: attrs.title || undefined,
      };

    case "cardGrid": {
      const cards = (children || []).map((child) => ({
        _key: generateKey(),
        _type: "cardItem",
        icon: child.attrs.icon || undefined,
        title: child.attrs.title || "",
        description: child.attrs.description || undefined,
        value: child.attrs.value || undefined,
        unit: child.attrs.unit || undefined,
        tags: child.attrs.tags
          ? child.attrs.tags.split(",").map((t: string) => t.trim())
          : undefined,
      }));
      return {
        _type: "cardGrid",
        _key: generateKey(),
        variant: attrs.variant || "info",
        columns: parseInt(attrs.columns || "3"),
        cards,
      };
    }

    case "pullQuote":
      return {
        _type: "pullQuote",
        _key: generateKey(),
        text: attrs.text || "",
        attribution: attrs.attribution || undefined,
        variant: attrs.variant || "default",
      };

    case "stepFlow": {
      const steps = (children || []).map((child) => ({
        _key: generateKey(),
        _type: "stepItem",
        title: child.attrs.title || "",
        description: child.attrs.description || undefined,
      }));
      return {
        _type: "stepFlow",
        _key: generateKey(),
        title: attrs.title || undefined,
        steps,
      };
    }

    case "divider":
      return {
        _type: "divider",
        _key: generateKey(),
        label: attrs.label || undefined,
      };

    case "customContainer": {
      // マークダウンのコンテンツをPortable Textに変換
      const contentHtml = marked.parse(attrs.content || "") as string;
      const contentBlocks = htmlToPortableText(contentHtml);
      return {
        _type: "customContainer",
        _key: generateKey(),
        containerType: attrs.containerType || "info",
        title: attrs.title || undefined,
        content: contentBlocks,
      };
    }

    default:
      console.warn(`未知のアノテーションタイプ: ${type}`);
      return null;
  }
}

// ── コンテンツ組み立て ──

function assembleContent(
  blocks: any[],
  tokens: AnnotationToken[]
): any[] {
  const result: any[] = [];

  for (const block of blocks) {
    if (block._type === "__placeholder__") {
      const token = tokens.find((t) => t.position === block._index);
      if (token) {
        const obj = annotationToSanityObject(token);
        if (obj) result.push(obj);
      }
    } else {
      result.push(block);
    }
  }

  return result;
}

// ── Sanity upsert ──

async function upsertGuide(
  frontmatter: Frontmatter,
  content: any[]
): Promise<void> {
  const { slug } = frontmatter;

  // 既存ドキュメントを検索
  const existing = await client.fetch(
    `*[_type == "guide" && slug.current == $slug][0]{ _id }`,
    { slug }
  );

  const doc: any = {
    _type: "guide",
    title: frontmatter.title,
    slug: { _type: "slug", current: frontmatter.slug },
    category: frontmatter.category,
    description: frontmatter.description,
    isPremium: frontmatter.isPremium || false,
    tags: frontmatter.tags || [],
    author: frontmatter.author || "BONO",
    readingTime: frontmatter.readingTime || undefined,
    publishedAt: new Date().toISOString(),
    content,
  };

  if (existing) {
    console.log(`📝 既存ドキュメントを更新: ${existing._id}`);
    await client
      .patch(existing._id)
      .set({
        title: doc.title,
        category: doc.category,
        description: doc.description,
        isPremium: doc.isPremium,
        tags: doc.tags,
        author: doc.author,
        readingTime: doc.readingTime,
        content: doc.content,
        updatedAt: new Date().toISOString(),
      })
      .commit();
    console.log("✅ 更新完了");
  } else {
    console.log("📝 新規ドキュメントを作成");
    const created = await client.create(doc);
    console.log(`✅ 作成完了: ${created._id}`);
  }
}

// ── メイン ──

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("使い方: npx tsx scripts/importGuide.ts <マークダウンファイル>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`ファイルが見つかりません: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`📄 読み込み: ${resolvedPath}`);
  const markdown = fs.readFileSync(resolvedPath, "utf-8");

  // 1. フロントマター解析
  const { frontmatter, body } = parseFrontmatter(markdown);
  console.log(`📋 タイトル: ${frontmatter.title}`);
  console.log(`🏷️  カテゴリ: ${frontmatter.category}`);
  console.log(`🔗 スラッグ: ${frontmatter.slug}`);

  // 2. アノテーション抽出
  const { tokens, cleaned } = extractAnnotations(body);
  console.log(`🔖 アノテーション: ${tokens.length}個`);

  // 3. マークダウン → HTML → Portable Text
  const html = marked.parse(cleaned) as string;
  const blocks = htmlToPortableText(html);
  console.log(`📝 ブロック: ${blocks.length}個`);

  // 4. 組み立て
  const content = assembleContent(blocks, tokens);
  console.log(`📦 最終コンテンツ: ${content.length}ブロック`);

  // 5. Sanity upsert
  await upsertGuide(frontmatter, content);
  console.log("\n🎉 インポート完了！");
  console.log(`   /guide/${frontmatter.slug} で確認できます`);
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
