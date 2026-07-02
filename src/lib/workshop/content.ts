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
}

export interface WorkshopDoc extends WorkshopDocMeta {
  content: string;
}

export interface WorkshopStepWithDocs extends WorkshopStep {
  docs: WorkshopDocMeta[];
}

const CONTENT_DIR = path.join(process.cwd(), "src/content/workshop");

function parseDocFile(filename: string): WorkshopDoc {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description,
    step: data.step ?? "intro",
    order: data.order ?? 99,
    note: data.note,
    content,
  };
}

function listDocFiles(): string[] {
  return fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
}

/** 全ドキュメントのメタ情報（本文なし） */
export function getAllDocs(): WorkshopDocMeta[] {
  return listDocFiles()
    .map(parseDocFile)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => a.order - b.order);
}

/** ステップ構成にドキュメントを紐付けたトップページ用データ */
export function getStepsWithDocs(): WorkshopStepWithDocs[] {
  const docs = getAllDocs();
  return WORKSHOP_STEPS.map((step) => ({
    ...step,
    docs: docs.filter((d) => d.step === step.id),
  })).filter((step) => step.docs.length > 0);
}

/** slug からドキュメント本文を取得 */
export function getDocBySlug(slug: string): WorkshopDoc | null {
  const filename = `${slug}.md`;
  if (!fs.existsSync(path.join(CONTENT_DIR, filename))) return null;
  return parseDocFile(filename);
}

/** generateStaticParams 用 */
export function getAllSlugs(): string[] {
  return listDocFiles().map((f) => f.replace(/\.md$/, ""));
}
