import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { WORKSHOP_STEPS, type WorkshopStep } from "./config";

export interface WorkshopDocMeta {
  slug: string;
  title: string;
  description?: string;
  step: string;
  order: number;
  /** "スキップ可能" 等の補足ラベル */
  note?: string;
  /** "1-1" のような記事番号（任意。指定するとタイトルの頭に番号と役割を付けて表示する） */
  number?: string;
  /** "考え方" / "やること" のような記事の役割（number とセットで使う） */
  role?: string;
}

export interface WorkshopDoc extends WorkshopDocMeta {
  content: string;
}

export interface WorkshopStepWithDocs extends WorkshopStep {
  docs: WorkshopDocMeta[];
}

export interface DocsContentSource {
  /** 全ドキュメントのメタ情報（本文なし） */
  getAllDocs: () => WorkshopDocMeta[];
  /** ステップ構成にドキュメントを紐付けたトップページ用データ */
  getStepsWithDocs: () => WorkshopStepWithDocs[];
  /** slug からドキュメント本文を取得 */
  getDocBySlug: (slug: string) => WorkshopDoc | null;
  /** generateStaticParams 用 */
  getAllSlugs: () => string[];
  /** 表示順で次にあたるドキュメント（最後のドキュメントなら null） */
  getNextDoc: (slug: string) => WorkshopDocMeta | null;
}

/**
 * Markdown + frontmatter（step / order）で構成するドキュメント置き場の読み込み処理。
 * /docs/workshop 以外のドキュメント置き場（例: /docs/number-challenge）も
 * contentDir と steps を差し替えて同じ仕組みを使う。
 */
export function createDocsContent({
  contentDir,
  steps,
}: {
  /** src/content 配下のフォルダ名（例: "workshop" → src/content/workshop） */
  contentDir: string;
  steps: WorkshopStep[];
}): DocsContentSource {
  function parseDocFile(filename: string): WorkshopDoc {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(
      // ビルド時のファイルトレースを src/content 配下に限定するため、パスは毎回この形で組み立てる
      path.join(process.cwd(), "src/content", contentDir, filename),
      "utf-8",
    );
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      description: data.description,
      step: data.step ?? "intro",
      order: data.order ?? 99,
      note: data.note,
      number: data.number,
      role: data.role,
      content,
    };
  }

  function listDocFiles(): string[] {
    return fs
      .readdirSync(path.join(process.cwd(), "src/content", contentDir))
      .filter((f) => f.endsWith(".md"));
  }

  function getAllDocs(): WorkshopDocMeta[] {
    return listDocFiles()
      .map(parseDocFile)
      .map(({ content: _content, ...meta }) => meta)
      .sort((a, b) => a.order - b.order);
  }

  function getStepsWithDocs(): WorkshopStepWithDocs[] {
    const docs = getAllDocs();
    return steps
      .map((step) => ({
        ...step,
        docs: docs.filter((d) => d.step === step.id),
      }))
      .filter((step) => step.docs.length > 0);
  }

  function getDocBySlug(slug: string): WorkshopDoc | null {
    const filename = `${slug}.md`;
    if (!fs.existsSync(path.join(process.cwd(), "src/content", contentDir, filename))) {
      return null;
    }
    return parseDocFile(filename);
  }

  function getAllSlugs(): string[] {
    return listDocFiles().map((f) => f.replace(/\.md$/, ""));
  }

  function getNextDoc(slug: string): WorkshopDocMeta | null {
    const docs = getAllDocs();
    const index = docs.findIndex((d) => d.slug === slug);
    if (index === -1 || index === docs.length - 1) return null;
    return docs[index + 1];
  }

  return { getAllDocs, getStepsWithDocs, getDocBySlug, getAllSlugs, getNextDoc };
}

// /docs/workshop 用（既存の import をそのまま使えるように個別に export する）
const workshopContent = createDocsContent({
  contentDir: "workshop",
  steps: WORKSHOP_STEPS,
});

export const {
  getAllDocs,
  getStepsWithDocs,
  getDocBySlug,
  getAllSlugs,
  getNextDoc,
} = workshopContent;
