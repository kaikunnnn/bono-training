// Markdown フィードバック5件を Sanity に投入するスクリプト
// 実行: node scripts/import-feedbacks.mjs
// dry-run: node scripts/import-feedbacks.mjs --dry

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const isDry = process.argv.includes("--dry");

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const FEEDBACK_DIR =
  "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/05_community/Feedback";

// カテゴリID（Sanity から取得済）
const CAT = {
  portfolio: "7nbZlTCHMT0Xw5zeBtdThO",
  "user-value-design": "7nbZlTCHMT0Xw5zeBtdUpM",
  "ui-style": "TiFkqy071fyvfy3gJq91QX",
  career: "VSAb2u553b0VaqdnxsaqfR",
};

// 投入対象（最新5件） — filename / slug / category
const TARGETS = [
  {
    file: "20260619_ANA_【ユースケース起点の情報設計】UIが使いづらい本当の原因を見抜くケーススタディ 🔍.md",
    slug: "ana-ui-case-study-2026-06",
    category: "ui-style",
  },
  {
    file: "20260615_なお_【ゴール起点のUI設計】機能ではなく「達成したい状態」を作る目を養うフィードバック 🎯.md",
    slug: "nao-budget-app-goal-driven",
    category: "user-value-design",
  },
  {
    file: "20260610_あおまめ_【UIの構造を真似る】コンテンツとアクションの関係性で投稿画面を整えるフィードバック 🧩.md",
    slug: "aomame-voice-sns-structure",
    category: "ui-style",
  },
  {
    file: "20260608_かな_【ユーザーインタビュー深掘り】「抽象まとめ」から「ユースケース起点」へ下ろすフィードバック 🔍.md",
    slug: "kana-book-selection-usecase",
    category: "user-value-design",
  },
  {
    file: "20260528_【課題の解像度】「使える額が見える」の先へ、衝動の手前を捉えるフィードバック 🔍.md",
    slug: "impulse-spending-savings-app",
    category: "user-value-design",
  },
];

// -----------------------------
// ファイル名 → publishedAt / title
// -----------------------------
function parseFilename(filename) {
  // 例: 20260619_ANA_【...】... 🔍.md
  const m = filename.match(/^(\d{4})(\d{2})(\d{2})_(?:[^_]+_)?(.+?)\.md$/);
  if (!m) throw new Error(`filename parse failed: ${filename}`);
  const [, y, mo, d, rest] = m;
  return {
    publishedAt: `${y}-${mo}-${d}T09:00:00.000Z`,
    title: rest.trim(),
  };
}

// -----------------------------
// MD パース: targetOutput / vimeoUrl / figmaUrl / bodyMd
// -----------------------------
function parseMd(raw) {
  const lines = raw.split("\n");
  // first non-empty line = targetOutput
  let targetOutput = "";
  for (const l of lines) {
    if (l.trim()) {
      targetOutput = l.trim();
      break;
    }
  }

  // Vimeo
  let vimeoUrl = "";
  const vIdx = lines.findIndex((l) => /^###\s+Vimeo/i.test(l));
  if (vIdx >= 0) {
    for (let i = vIdx + 1; i < Math.min(vIdx + 4, lines.length); i++) {
      const t = lines[i].trim();
      if (!t) continue;
      if (t.startsWith("###") || t === "---") break;
      const um = t.match(/(https?:\/\/\S+)/);
      if (um) {
        vimeoUrl = um[1];
        break;
      }
    }
  }

  // Figma (FB Data)
  let figmaUrl = "";
  const fIdx = lines.findIndex((l) => /^###\s+Figma/i.test(l));
  if (fIdx >= 0) {
    for (let i = fIdx + 1; i < Math.min(fIdx + 4, lines.length); i++) {
      const t = lines[i].trim();
      if (!t) continue;
      if (t.startsWith("###") || t === "---") break;
      const um = t.match(/(https?:\/\/\S+)/);
      if (um) {
        figmaUrl = um[1];
        break;
      }
    }
  }

  // Excerpt = サマリー直下の最初の段落
  let excerpt = "";
  const sIdx = lines.findIndex((l) => /^##\s*📝\s*(今日の)?サマリー/.test(l));
  if (sIdx >= 0) {
    const buf = [];
    for (let i = sIdx + 1; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t) {
        if (buf.length > 0) break;
        continue;
      }
      if (t.startsWith("##") || t === "---") break;
      buf.push(t);
    }
    // Markdown装飾を除去（太字 ** / リンク []() / 強調 *）
    excerpt = buf
      .join(" ")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*(.+?)\*/g, "$1");
    if (excerpt.length > 240) excerpt = excerpt.slice(0, 240) + "…";
  }

  // Body = 最初の `## 1.` 以降のすべて (= 番号付き本文セクション群)
  // ない場合は サマリー以降 全部
  let bodyStart = lines.findIndex((l) => /^##\s*1\.\s/.test(l));
  if (bodyStart < 0) bodyStart = sIdx >= 0 ? sIdx : 0;
  const bodyMd = lines.slice(bodyStart).join("\n");

  return { targetOutput, vimeoUrl, figmaUrl, excerpt, bodyMd };
}

// -----------------------------
// Markdown → PortableText 変換（最小限）
// 対応: H2 (##) / H3 (###) / H4 (####) / 段落 / 箇条書き / 番号付きリスト / 引用 (>)
//      `---` 区切りは無視、コードブロック・テーブルはプレーン段落化
// 装飾: **bold** / [text](url) を marks 化
// -----------------------------
let keyCounter = 0;
function k(prefix = "k") {
  keyCounter++;
  return `${prefix}${keyCounter}`;
}

function makeSpanChildren(text) {
  // [text](url) → link marks
  // **bold** → strong marks
  const children = [];
  const markDefs = [];
  // Simple parser: walk through chars
  let i = 0;
  let cur = "";
  const flush = (marks = []) => {
    if (cur) {
      children.push({ _key: k("c"), _type: "span", text: cur, marks });
      cur = "";
    }
  };
  while (i < text.length) {
    // link [text](url)
    if (text[i] === "[") {
      const close = text.indexOf("](", i);
      const end = close >= 0 ? text.indexOf(")", close) : -1;
      if (close > i && end > close) {
        flush();
        const linkText = text.slice(i + 1, close);
        const url = text.slice(close + 2, end);
        const defKey = k("def");
        markDefs.push({ _key: defKey, _type: "link", href: url });
        children.push({
          _key: k("c"),
          _type: "span",
          text: linkText,
          marks: [defKey],
        });
        i = end + 1;
        continue;
      }
    }
    // bold **text**
    if (text[i] === "*" && text[i + 1] === "*") {
      const closeIdx = text.indexOf("**", i + 2);
      if (closeIdx > i + 2) {
        flush();
        const boldText = text.slice(i + 2, closeIdx);
        children.push({
          _key: k("c"),
          _type: "span",
          text: boldText,
          marks: ["strong"],
        });
        i = closeIdx + 2;
        continue;
      }
    }
    cur += text[i];
    i++;
  }
  flush();
  if (children.length === 0) {
    children.push({ _key: k("c"), _type: "span", text: "", marks: [] });
  }
  return { children, markDefs };
}

function mdToBlocks(md) {
  const blocks = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行
    if (!trimmed) {
      i++;
      continue;
    }
    // 水平線
    if (/^---+$/.test(trimmed)) {
      i++;
      continue;
    }
    // コードブロック (```...```) → 中身を normal にまとめる
    if (trimmed.startsWith("```")) {
      i++;
      const buf = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // close ```
      if (buf.length) {
        const { children, markDefs } = makeSpanChildren(buf.join(" "));
        blocks.push({
          _key: k("b"),
          _type: "block",
          style: "normal",
          markDefs,
          children,
        });
      }
      continue;
    }
    // 見出し
    const hMatch = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const style = level === 2 ? "h2" : level === 3 ? "h3" : "h4";
      const { children, markDefs } = makeSpanChildren(hMatch[2]);
      blocks.push({
        _key: k("b"),
        _type: "block",
        style,
        markDefs,
        children,
      });
      i++;
      continue;
    }
    // 引用 >
    if (trimmed.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const { children, markDefs } = makeSpanChildren(buf.join(" "));
      blocks.push({
        _key: k("b"),
        _type: "block",
        style: "blockquote",
        markDefs,
        children,
      });
      continue;
    }
    // 箇条書きリスト
    if (/^[-*]\s+/.test(trimmed)) {
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, "");
        // チェックボックス除去 [ ] / [x]
        const cleaned = item.replace(/^\[[ xX]\]\s*/, "");
        const { children, markDefs } = makeSpanChildren(cleaned);
        blocks.push({
          _key: k("b"),
          _type: "block",
          style: "normal",
          listItem: "bullet",
          level: 1,
          markDefs,
          children,
        });
        i++;
      }
      continue;
    }
    // 番号付きリスト
    if (/^\d+\.\s+/.test(trimmed)) {
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^\d+\.\s+/, "");
        const { children, markDefs } = makeSpanChildren(item);
        blocks.push({
          _key: k("b"),
          _type: "block",
          style: "normal",
          listItem: "number",
          level: 1,
          markDefs,
          children,
        });
        i++;
      }
      continue;
    }
    // 通常段落（連続行をまとめる）
    {
      const buf = [trimmed];
      i++;
      while (i < lines.length) {
        const t = lines[i].trim();
        if (
          !t ||
          /^#{2,4}\s/.test(t) ||
          /^---+$/.test(t) ||
          /^[-*]\s+/.test(t) ||
          /^\d+\.\s+/.test(t) ||
          t.startsWith(">") ||
          t.startsWith("```")
        )
          break;
        buf.push(t);
        i++;
      }
      const { children, markDefs } = makeSpanChildren(buf.join(" "));
      blocks.push({
        _key: k("b"),
        _type: "block",
        style: "normal",
        markDefs,
        children,
      });
    }
  }
  return blocks;
}

// -----------------------------
// Document 構築
// -----------------------------
function buildDoc(target) {
  const raw = fs.readFileSync(path.join(FEEDBACK_DIR, target.file), "utf8");
  const { publishedAt, title } = parseFilename(target.file);
  const { targetOutput, vimeoUrl, figmaUrl, excerpt, bodyMd } = parseMd(raw);
  keyCounter = 0; // reset per doc

  const doc = {
    _id: `feedback-${target.slug}`,
    _type: "feedback",
    title,
    slug: { _type: "slug", current: target.slug },
    category: { _type: "reference", _ref: CAT[target.category] },
    publishedAt,
    targetOutput,
    excerpt,
    feedbackContent: mdToBlocks(bodyMd),
  };
  if (vimeoUrl) doc.vimeoUrl = vimeoUrl;
  if (figmaUrl) doc.figmaUrl = figmaUrl;
  return doc;
}

// -----------------------------
// Main
// -----------------------------
(async () => {
  const docs = TARGETS.map(buildDoc);

  console.log(`\n${isDry ? "[DRY RUN]" : "[LIVE]"} ${docs.length} docs:\n`);
  for (const d of docs) {
    console.log(
      `  ${d.slug}  title="${d.title.slice(0, 40)}…"  blocks=${d.feedbackContent.length}  vimeo=${!!d.vimeoUrl}  figma=${!!d.figmaUrl}`
    );
  }

  if (isDry) {
    fs.writeFileSync(
      "scripts/import-feedbacks.preview.json",
      JSON.stringify(docs, null, 2)
    );
    console.log("\nDry run. Wrote scripts/import-feedbacks.preview.json");
    return;
  }

  // createOrReplace で冪等に
  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d);
  const res = await tx.commit();
  console.log("\nDone. Created/updated:", res.results.length);
})();
