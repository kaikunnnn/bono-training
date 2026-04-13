/**
 * Training コンテンツ移行スクリプト
 * /content/training/ のMarkdownファイルをSanityに投入する
 *
 * 使い方:
 *   cd sanity-studio
 *   npx tsx scripts/migrate-training.ts
 *
 * 環境変数:
 *   SANITY_STUDIO_PROJECT_ID (sanity.config.ts から取得)
 *   SANITY_STUDIO_DATASET (デフォルト: development)
 *   SANITY_AUTH_TOKEN (Sanity管理画面で発行)
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

// --- 設定 ---
const PROJECT_ID = "cqszh4up";
const DATASET = process.env.SANITY_STUDIO_DATASET || "development";
const TOKEN = process.env.SANITY_AUTH_TOKEN;

if (!TOKEN) {
  console.error("❌ SANITY_AUTH_TOKEN が設定されていません");
  console.error("   Sanity管理画面 → Settings → API → Tokens で発行してください");
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  useCdn: false,
  apiVersion: "2024-01-01",
});

const CONTENT_DIR = path.resolve(__dirname, "../../content/training");

// --- YAML フロントマターパーサー ---
function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const frontmatter = parseYaml(yamlStr);
  return { frontmatter, body };
}

function parseYaml(yaml: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yaml.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^(\w[\w_]*)\s*:\s*(.*)/);

    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    let value = keyMatch[2].trim();

    // 配列 (インライン)
    if (value.startsWith("[")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""));
      i++;
      continue;
    }

    // 配列/オブジェクト (ブロック)
    if (value === "" || value === "|") {
      const isMultiline = value === "|";
      const children = collectIndentedBlock(lines, i + 1);

      if (children.length > 0 && children[0].trimStart().startsWith("- ")) {
        result[key] = parseYamlArray(children);
      } else if (isMultiline) {
        result[key] = children.map((l) => l.replace(/^ {2,}/, "")).join("\n");
      } else {
        result[key] = parseYamlObject(children);
      }
      i += children.length + 1;
      continue;
    }

    // ブール値
    if (value === "true") { result[key] = true; i++; continue; }
    if (value === "false") { result[key] = false; i++; continue; }

    // 数値
    if (/^\d+$/.test(value)) { result[key] = parseInt(value, 10); i++; continue; }

    // 文字列
    result[key] = value.replace(/^["']|["']$/g, "");
    i++;
  }

  return result;
}

function collectIndentedBlock(lines: string[], start: number): string[] {
  const block: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (lines[i] === "" || /^\s+/.test(lines[i])) {
      block.push(lines[i]);
    } else {
      break;
    }
  }
  // 末尾の空行を削除
  while (block.length > 0 && block[block.length - 1].trim() === "") {
    block.pop();
  }
  return block;
}

function parseYamlArray(lines: string[]): any[] {
  const items: any[] = [];
  let currentItem: string[] = [];

  for (const line of lines) {
    if (line.trimStart().startsWith("- ") && !line.trimStart().startsWith("- -")) {
      if (currentItem.length > 0) {
        items.push(parseYamlArrayItem(currentItem));
      }
      currentItem = [line];
    } else {
      currentItem.push(line);
    }
  }
  if (currentItem.length > 0) {
    items.push(parseYamlArrayItem(currentItem));
  }

  return items;
}

function parseYamlArrayItem(lines: string[]): any {
  const firstLine = lines[0].trimStart().replace(/^- /, "");

  // オブジェクト形式のアイテム (- key: value)
  if (firstLine.includes(":")) {
    const obj: Record<string, any> = {};
    const keyMatch = firstLine.match(/^(\w[\w_]*)\s*:\s*(.*)/);
    if (keyMatch) {
      const key = keyMatch[1];
      let value = keyMatch[2].trim();

      if (value === "|") {
        // マルチライン値
        const contentLines = lines.slice(1).map((l) => l.replace(/^ {6,}/, ""));
        obj[key] = contentLines.join("\n").trim();
      } else {
        obj[key] = value.replace(/^["']|["']$/g, "");
      }

      // 残りの行もパース
      for (let i = 1; i < lines.length; i++) {
        const subMatch = lines[i].trimStart().match(/^(\w[\w_]*)\s*:\s*(.*)/);
        if (subMatch) {
          const subKey = subMatch[1];
          let subValue = subMatch[2].trim();
          if (subValue === "|") {
            const subContentLines: string[] = [];
            for (let j = i + 1; j < lines.length; j++) {
              const nextMatch = lines[j].trimStart().match(/^(\w[\w_]*)\s*:/);
              if (nextMatch) break;
              subContentLines.push(lines[j].replace(/^ {6,}/, ""));
            }
            obj[subKey] = subContentLines.join("\n").trim();
          } else {
            obj[subKey] = subValue.replace(/^["']|["']$/g, "");
          }
        }
      }
    }
    return obj;
  }

  // 単純な文字列
  return firstLine.replace(/^["']|["']$/g, "");
}

function parseYamlObject(lines: string[]): Record<string, any> {
  const deindented = lines.map((l) => l.replace(/^ {2}/, ""));
  return parseYaml(deindented.join("\n"));
}

// --- Markdown → Portable Text 変換 ---
function markdownToPortableText(markdown: string): any[] {
  if (!markdown || !markdown.trim()) return [];

  const blocks: any[] = [];
  const lines = markdown.split("\n");
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join("\n").trim();
      if (text) {
        blocks.push(createBlock("normal", text));
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    // 見出し
    const h4Match = line.match(/^####\s+(.+)/);
    if (h4Match) { flushParagraph(); blocks.push(createBlock("h4", h4Match[1])); continue; }

    const h3Match = line.match(/^###\s+(.+)/);
    if (h3Match) { flushParagraph(); blocks.push(createBlock("h3", h3Match[1])); continue; }

    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) { flushParagraph(); blocks.push(createBlock("h2", h2Match[1])); continue; }

    // 箇条書き
    const listMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (listMatch) {
      flushParagraph();
      blocks.push(createListBlock(listMatch[2], "bullet"));
      continue;
    }

    // 番号付きリスト
    const numListMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (numListMatch) {
      flushParagraph();
      blocks.push(createListBlock(numListMatch[2], "number"));
      continue;
    }

    // 空行
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    currentParagraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function createBlock(style: string, text: string): any {
  return {
    _type: "block",
    _key: generateKey(),
    style,
    children: parseInlineMarkdown(text),
    markDefs: [],
  };
}

function createListBlock(text: string, listType: "bullet" | "number"): any {
  return {
    _type: "block",
    _key: generateKey(),
    style: "normal",
    listItem: listType,
    level: 1,
    children: parseInlineMarkdown(text),
    markDefs: [],
  };
}

function parseInlineMarkdown(text: string): any[] {
  // リンクと太字のパース
  const spans: any[] = [];
  const markDefs: any[] = [];
  let remaining = text;

  // シンプルなアプローチ: リンクと太字を順にパース
  const parts = remaining.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/);

  for (const part of parts) {
    // リンク
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const linkKey = generateKey();
      markDefs.push({
        _type: "link",
        _key: linkKey,
        href: linkMatch[2],
      });
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: linkMatch[1],
        marks: [linkKey],
      });
      continue;
    }

    // 太字
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: boldMatch[1],
        marks: ["strong"],
      });
      continue;
    }

    // 通常テキスト
    if (part) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: part,
        marks: [],
      });
    }
  }

  // markDefsをブロックに入れるために返す
  if (spans.length === 0) {
    spans.push({ _type: "span", _key: generateKey(), text: "", marks: [] });
  }

  // markDefsをspansの最初の要素に付与（後でブロックレベルで統合）
  (spans as any).__markDefs = markDefs;

  return spans;
}

// markDefsをブロックに統合するヘルパー
function createBlockWithLinks(style: string, text: string): any {
  const children = parseInlineMarkdown(text);
  const markDefs = (children as any).__markDefs || [];
  return {
    _type: "block",
    _key: generateKey(),
    style,
    children,
    markDefs,
  };
}

let keyCounter = 0;
function generateKey(): string {
  return `key${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

// --- メイン処理 ---
async function migrate() {
  console.log(`🚀 Training移行開始 (dataset: ${DATASET})`);
  console.log(`📁 コンテンツディレクトリ: ${CONTENT_DIR}`);

  const trainingDirs = fs.readdirSync(CONTENT_DIR).filter((name) => {
    return fs.statSync(path.join(CONTENT_DIR, name)).isDirectory();
  });

  console.log(`📋 ${trainingDirs.length}件のトレーニングを移行します\n`);

  // カテゴリのマッピング（Sanityに既存のcategoryドキュメントを取得）
  const categories = await client.fetch(`*[_type == "category"]{ _id, title }`);
  const categoryMap = new Map(categories.map((c: any) => [c.title, c._id]));
  console.log(`📂 カテゴリ: ${Array.from(categoryMap.keys()).join(", ")}\n`);

  for (const dirName of trainingDirs) {
    const trainingDir = path.join(CONTENT_DIR, dirName);
    const indexPath = path.join(trainingDir, "index.md");

    if (!fs.existsSync(indexPath)) {
      console.warn(`⚠️ ${dirName}: index.md が見つかりません。スキップ`);
      continue;
    }

    const indexContent = fs.readFileSync(indexPath, "utf-8");
    const { frontmatter } = parseFrontmatter(indexContent);

    console.log(`📝 ${frontmatter.title || dirName}`);

    // Training ドキュメント作成（IDにスペース不可のためサニタイズ）
    const sanitizedDirName = dirName.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    const trainingId = `training-${sanitizedDirName}`;
    const trainingDoc: Record<string, any> = {
      _id: trainingId,
      _type: "training",
      title: frontmatter.title || dirName,
      slug: { _type: "slug", current: dirName },
      description: frontmatter.description || "",
      trainingType: frontmatter.type || "challenge",
      difficulty: frontmatter.difficulty || "normal",
      tags: frontmatter.tags || [],
      isPremium: frontmatter.isPremium || false,
      orderIndex: frontmatter.order_index || 0,
      iconImageUrl: frontmatter.icon || undefined,
      thumbnailUrl: frontmatter.thumbnail || undefined,
      backgroundSvg: frontmatter.background_svg || undefined,
      estimatedTotalTime: frontmatter.estimated_total_time || undefined,
    };

    // カテゴリ参照
    if (frontmatter.category && categoryMap.has(frontmatter.category)) {
      trainingDoc.category = {
        _type: "reference",
        _ref: categoryMap.get(frontmatter.category),
      };
    }

    // グラデーション
    if (frontmatter.fallback_gradient) {
      trainingDoc.fallbackGradient = {
        from: frontmatter.fallback_gradient.from || "",
        via: frontmatter.fallback_gradient.via || "",
        to: frontmatter.fallback_gradient.to || "",
      };
    }

    // スキル
    if (frontmatter.skills && Array.isArray(frontmatter.skills)) {
      trainingDoc.skills = frontmatter.skills.map((s: any) => ({
        _key: generateKey(),
        title: s.title || "",
        description: s.description || "",
        referenceLink: s.reference_link || undefined,
      }));
    }

    // ガイド
    if (frontmatter.guide) {
      trainingDoc.guide = {
        title: frontmatter.guide.title || "",
        description: frontmatter.guide.description || "",
        lesson: frontmatter.guide.lesson
          ? {
              title: frontmatter.guide.lesson.title || "",
              image: frontmatter.guide.lesson.image || undefined,
              description: frontmatter.guide.lesson.description || "",
              link: frontmatter.guide.lesson.link || undefined,
            }
          : undefined,
        steps: frontmatter.guide.steps
          ? frontmatter.guide.steps.map((s: any) => ({
              _key: generateKey(),
              title: s.title || "",
              description: s.description || "",
            }))
          : [],
      };
    }

    // 1. まずトレーニングを作成（タスク参照なし）
    trainingDoc.tasks = [];
    await client.createOrReplace(trainingDoc);
    console.log(`   ✅ トレーニング作成: ${trainingId}`);

    // 2. タスクを作成
    const tasksDir = path.join(trainingDir, "tasks");
    const taskRefs: any[] = [];

    if (fs.existsSync(tasksDir)) {
      const taskDirs = fs.readdirSync(tasksDir).filter((name) => {
        return fs.statSync(path.join(tasksDir, name)).isDirectory();
      });

      for (const taskDirName of taskDirs) {
        const contentPath = path.join(tasksDir, taskDirName, "content.md");
        if (!fs.existsSync(contentPath)) continue;

        const taskContent = fs.readFileSync(contentPath, "utf-8");
        const { frontmatter: taskFm, body: taskBody } = parseFrontmatter(taskContent);

        const taskSlug = taskFm.slug || taskDirName;
        const sanitizedTaskSlug = String(taskSlug).trim().replace(/[^a-zA-Z0-9_-]/g, "-");
        const taskId = `trainingTask-${sanitizedDirName}-${sanitizedTaskSlug}`;

        console.log(`   📋 タスク: ${taskFm.title || taskDirName}`);

        // セクションをPortable Textに変換
        const sections: any[] = [];
        if (taskFm.sections && Array.isArray(taskFm.sections)) {
          for (const section of taskFm.sections) {
            sections.push({
              _key: generateKey(),
              sectionTitle: section.title || "",
              sectionType: section.type || "regular",
              content: section.content
                ? markdownToPortableText(section.content)
                : [],
            });
          }
        }

        // 本文もセクションとして追加（フロントマター以降のMarkdown）
        if (taskBody && taskBody.trim()) {
          sections.push({
            _key: generateKey(),
            sectionTitle: "本文",
            sectionType: "regular",
            content: markdownToPortableText(taskBody),
          });
        }

        const taskDoc: Record<string, any> = {
          _id: taskId,
          _type: "trainingTask",
          title: taskFm.title || taskDirName,
          slug: { _type: "slug", current: taskSlug },
          description: taskFm.description || "",
          orderIndex: taskFm.order_index || 1,
          isPremium: taskFm.is_premium || false,
          category: taskFm.category || undefined,
          tags: taskFm.tags || [],
          videoFull: taskFm.video_member || taskFm.video_full || undefined,
          videoPreview: taskFm.video_free || taskFm.video_preview || undefined,
          previewSec: taskFm.preview_sec || undefined,
          training: { _type: "reference", _ref: trainingId },
          sections,
        };

        await client.createOrReplace(taskDoc);
        console.log(`   ✅ タスク作成: ${taskId}`);

        taskRefs.push({
          _type: "reference",
          _ref: taskId,
          _key: generateKey(),
        });
      }
    }

    // 3. トレーニングにタスク参照を追加
    if (taskRefs.length > 0) {
      await client.patch(trainingId).set({ tasks: taskRefs }).commit();
      console.log(`   ✅ タスク参照追加: ${taskRefs.length}件`);
    }

    console.log(`✅ 完了: ${frontmatter.title || dirName}\n`);
  }

  console.log("🎉 移行完了！");
}

migrate().catch((err) => {
  console.error("❌ 移行エラー:", err);
  process.exit(1);
});
