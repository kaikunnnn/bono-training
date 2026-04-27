/**
 * シナリオベースドデザイン レッスンの3記事を実原稿で更新するスクリプト
 *
 * 使用方法:
 * SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/update-scenario-articles.ts
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";

const client = createClient({
  projectId: "cqszh4up",
  dataset: process.env.SANITY_STUDIO_DATASET || "development",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// 既存記事のID（create-scenario-based-design-lesson.ts で作成済み）
const ARTICLE_IDS = {
  article1: "DffzGbpkg3dfjSnZeMnDCK",
  article2: "DffzGbpkg3dfjSnZeMnDG0",
  article3: "EEIdBlze5ccSdWUFeGu53d",
};

const FILE_PATHS = {
  article1: "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/02_Projects/02_情報設計/03_corse_content/ver2/01_全体像/02_作成原稿.md",
  article2: "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/02_Projects/02_情報設計/03_corse_content/ver2/02_フレーム1/02_作成原稿.md",
  article3: "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/02_Projects/02_情報設計/03_corse_content/ver2/03_フレーム2/02_作成原稿.md",
};

// ============================================================
// キー生成
// ============================================================
let keyCounter = 0;
function key(): string {
  return `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

// ============================================================
// インライン Markdown パーサー（太字・コード・リンク）
// ============================================================
function parseInline(text: string): { children: any[]; markDefs: any[] } {
  const markDefs: any[] = [];
  const children: any[] = [];
  // 太字 **text** / インラインコード `text` / リンク [text](url)
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (plain) children.push({ _type: "span", _key: key(), text: plain, marks: [] });
    }

    if (match[2] !== undefined) {
      // 太字
      children.push({ _type: "span", _key: key(), text: match[2], marks: ["strong"] });
    } else if (match[3] !== undefined) {
      // インラインコード → プレーンテキストとして扱う（画像プレースホルダーなど）
      children.push({ _type: "span", _key: key(), text: match[3], marks: [] });
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // リンク
      const linkKey = key();
      markDefs.push({ _type: "link", _key: linkKey, href: match[5] });
      children.push({ _type: "span", _key: key(), text: match[4], marks: [linkKey] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const rest = text.slice(lastIndex);
    if (rest) children.push({ _type: "span", _key: key(), text: rest, marks: [] });
  }

  if (children.length === 0) {
    children.push({ _type: "span", _key: key(), text: text, marks: [] });
  }

  return { children, markDefs };
}

// ============================================================
// ブロック生成ヘルパー
// ============================================================
function makeBlock(style: string, text: string): any {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: key(), style, children, markDefs };
}

function makeListBlock(text: string, listItem: "bullet" | "number"): any {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: key(), style: "normal", listItem, level: 1, children, markDefs };
}

// ============================================================
// Markdown → Portable Text 変換
// ============================================================
function mdToPortableText(md: string): any[] {
  const blocks: any[] = [];
  const lines = md.split("\n");
  let i = 0;
  let paraLines: string[] = [];

  const flushPara = () => {
    if (paraLines.length === 0) return;
    const text = paraLines.join(" ").trim();
    if (text) blocks.push(makeBlock("normal", text));
    paraLines = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // コードブロック開始（``` で始まる行）
    if (/^```/.test(line)) {
      flushPara();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 閉じ ``` をスキップ
      // コードブロック内は markdown として再帰的に変換
      const inner = codeLines.join("\n");
      const innerBlocks = mdToPortableText(inner);
      blocks.push(...innerBlocks);
      continue;
    }

    // 水平線 → スキップ
    if (/^---+$/.test(line.trim())) {
      flushPara();
      i++;
      continue;
    }

    // h4
    const h4 = line.match(/^####\s+(.*)/);
    if (h4) {
      flushPara();
      blocks.push(makeBlock("h4", h4[1]));
      i++;
      continue;
    }

    // h3
    const h3 = line.match(/^###\s+(.*)/);
    if (h3) {
      flushPara();
      blocks.push(makeBlock("h3", h3[1]));
      i++;
      continue;
    }

    // h2
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      flushPara();
      blocks.push(makeBlock("h2", h2[1]));
      i++;
      continue;
    }

    // h1（タイトル行など）→ h2 として扱う
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) {
      flushPara();
      blocks.push(makeBlock("h2", h1[1]));
      i++;
      continue;
    }

    // 引用（blockquote）
    if (/^>/.test(line)) {
      flushPara();
      const quoteText = line.replace(/^>\s?/, "").trim();
      if (quoteText) blocks.push(makeBlock("blockquote", quoteText));
      i++;
      continue;
    }

    // 箇条書き（- または *）
    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      flushPara();
      blocks.push(makeListBlock(bullet[1], "bullet"));
      i++;
      continue;
    }

    // 番号付きリスト
    const numbered = line.match(/^\d+\.\s+(.*)/);
    if (numbered) {
      flushPara();
      blocks.push(makeListBlock(numbered[1], "number"));
      i++;
      continue;
    }

    // 末尾のナビリンク行（URLなしの [text] 形式）を除外
    // 例: [フレームワーク解説1：...]  / 👇 次のコンテンツへ進む
    if (/^\[.*\]$/.test(line.trim()) || /^👇/.test(line.trim())) {
      flushPara();
      i++;
      continue;
    }

    // 空行 → 段落区切り
    if (line.trim() === "") {
      flushPara();
      i++;
      continue;
    }

    // 通常テキスト → 段落に蓄積
    paraLines.push(line);
    i++;
  }

  flushPara();
  return blocks;
}

// ============================================================
// Markdown ファイルのメタデータとボディを分離
// ============================================================
interface ArticleMeta {
  title: string;
  articleType: string;
  body: string;
}

function parseMd(content: string): ArticleMeta {
  const lines = content.split("\n");
  let title = "";
  let articleType = "explain";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // タイトル行（# タイトル：xxx）
    const titleMatch = line.match(/^#\s+タイトル[：:]\s*(.*)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      bodyStart = i + 1;
      continue;
    }

    // type 行
    const typeMatch = line.match(/^type\s*:\s*(\w+)/);
    if (typeMatch) {
      articleType = typeMatch[1].trim();
      bodyStart = i + 1;
      continue;
    }

    // 最初の実コンテンツ行に到達したら終了
    if (i > 5 && line.trim() && !line.startsWith("#") && !line.startsWith("type")) {
      bodyStart = i;
      break;
    }
  }

  const body = lines.slice(bodyStart).join("\n");
  return { title, articleType, body };
}

// ============================================================
// 各記事の更新データ
// ============================================================
interface ArticleUpdate {
  id: string;
  filePath: string;
  articleNumber: number;
  slug: string;
  excerpt: string;
  tags: string[];
  learningObjectives: string[];
}

const ARTICLES: ArticleUpdate[] = [
  {
    id: ARTICLE_IDS.article1,
    filePath: FILE_PATHS.article1,
    articleNumber: 1,
    slug: "scenario-based-design-overview",
    excerpt: "「要件の項目は全部入れたし、見た目も綺麗！」なのになぜか使われないUI。その罠の正体と、ユーザーが本当に使ってくれる体験を作るシナリオベースドデザインの考え方を解説します。",
    tags: ["シナリオ", "UIデザイン", "UX", "思考法"],
    learningObjectives: [
      "「綺麗なUI」がなぜ使われないのかを説明できる",
      "シナリオベースドデザインの概念と3ステップを理解できる",
      "シナリオによってUIがどう変わるかをBeforeAfterで把握できる",
    ],
  },
  {
    id: ARTICLE_IDS.article2,
    filePath: FILE_PATHS.article2,
    articleNumber: 2,
    slug: "scenario-based-design-step1-inventory",
    excerpt: "Figmaを開く前にやるべき「体験の棚卸し」。ユーザーシナリオを起点に、機械的なフロー整理・感情の書き出し・配慮ポイントの抽出まで4ステップで実践します。",
    tags: ["シナリオ", "体験設計", "実践", "フレームワーク"],
    learningObjectives: [
      "体験の棚卸し4ステップを実践できる",
      "ユーザーの感情をフローごとに書き出せる",
      "感情から「UIで配慮すべきこと」を導けるようになる",
    ],
  },
  {
    id: ARTICLE_IDS.article3,
    filePath: FILE_PATHS.article3,
    articleNumber: 3,
    slug: "scenario-based-design-step2-ideal-experience",
    excerpt: "「配慮すべきこと」をUIアイデアに変換する方法。価値定義・理想の体験フロー・UIアイデアのブレストまで、シナリオから逆算するデザインプロセスを実践します。",
    tags: ["シナリオ", "体験設計", "UIアイデア", "実践"],
    learningObjectives: [
      "価値定義のフォーマットを使って方針を言語化できる",
      "「理想の体験の流れ」をストーリーとして描ける",
      "体験フローからUIアイデアをブレストできる",
    ],
  },
];

// ============================================================
// メイン処理
// ============================================================
async function main() {
  console.log("🚀 シナリオベースドデザイン 記事更新開始");
  console.log("Dataset:", client.config().dataset);

  if (!process.env.SANITY_API_TOKEN) {
    console.error("\n❌ SANITY_API_TOKEN が設定されていません。");
    console.log("SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/update-scenario-articles.ts");
    return;
  }

  for (const article of ARTICLES) {
    console.log(`\n📝 記事${article.articleNumber} 処理中...`);

    const raw = fs.readFileSync(article.filePath, "utf-8");
    const { title, articleType, body } = parseMd(raw);
    const content = mdToPortableText(body);

    console.log(`   タイトル : ${title}`);
    console.log(`   タイプ   : ${articleType}`);
    console.log(`   ブロック数: ${content.length}`);

    await client
      .patch(article.id)
      .set({
        articleNumber: article.articleNumber,
        title,
        slug: { _type: "slug", current: article.slug },
        articleType,
        excerpt: article.excerpt,
        tags: article.tags,
        learningObjectives: article.learningObjectives,
        content,
        publishedAt: new Date().toISOString(),
        author: "bono",
      })
      .commit();

    console.log(`   ✅ 更新完了 (ID: ${article.id})`);
  }

  console.log("\n🎉 全記事の更新完了！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📚 レッスン: /lessons/scenario-based-design");
  ARTICLES.forEach(a => console.log(`📝 記事${a.articleNumber}: ID ${a.id}`));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(err => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
