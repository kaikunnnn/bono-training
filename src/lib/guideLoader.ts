import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Guide, GuideCategory } from "@/types/guide";

const guidesDirectory = path.join(process.cwd(), "content/guide");

/**
 * すべてのガイドフォルダを再帰的に取得
 */
function getGuideDirectories(dir: string): string[] {
  const directories: string[] = [];

  if (!fs.existsSync(dir)) {
    return directories;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      const itemPath = path.join(dir, item.name);
      const indexPath = path.join(itemPath, "index.md");

      if (fs.existsSync(indexPath)) {
        directories.push(itemPath);
      } else {
        // サブディレクトリを再帰的にチェック
        directories.push(...getGuideDirectories(itemPath));
      }
    }
  }

  return directories;
}

/**
 * ディレクトリパスからslugを抽出
 */
function extractSlugFromPath(dirPath: string): string {
  return path.basename(dirPath);
}

/**
 * すべてのガイド記事を取得
 */
export function getAllGuides(): Guide[] {
  const directories = getGuideDirectories(guidesDirectory);
  const guides: Guide[] = [];

  for (const dir of directories) {
    const indexPath = path.join(dir, "index.md");

    try {
      const fileContents = fs.readFileSync(indexPath, "utf8");
      const { data: frontmatter, content } = matter(fileContents);
      const slug = extractSlugFromPath(dir);

      const guide: Guide = {
        title: frontmatter.title || "",
        description: frontmatter.description || "",
        slug,
        category: frontmatter.category as GuideCategory,
        tags: frontmatter.tags || [],
        thumbnail: frontmatter.thumbnail,
        icon: frontmatter.icon,
        order_index: frontmatter.order_index || 999,
        author: frontmatter.author || "BONO",
        publishedAt: frontmatter.publishedAt || "",
        updatedAt: frontmatter.updatedAt,
        readingTime: frontmatter.readingTime || "5分",
        isPremium: frontmatter.isPremium || false,
        seo: frontmatter.seo,
        relatedGuides: frontmatter.relatedGuides || [],
        content,
      };

      guides.push(guide);
    } catch (error) {
      console.error(`Error reading guide at ${dir}:`, error);
    }
  }

  // order_indexでソート
  return guides.sort((a, b) => a.order_index - b.order_index);
}

/**
 * slugで特定のガイド記事を取得
 */
export function getGuide(slug: string): Guide | null {
  const guides = getAllGuides();
  return guides.find((guide) => guide.slug === slug) || null;
}

/**
 * カテゴリで絞り込んだガイド記事を取得
 */
export function getGuidesByCategory(category: GuideCategory): Guide[] {
  const guides = getAllGuides();
  return guides.filter((guide) => guide.category === category);
}

/**
 * すべてのガイドスラッグを取得（静的生成用）
 */
export function getAllGuideSlugs(): string[] {
  const guides = getAllGuides();
  return guides.map((guide) => guide.slug);
}

/**
 * 関連ガイドを取得
 */
export function getRelatedGuides(slugs: string[]): Guide[] {
  const guides = getAllGuides();
  return guides.filter((guide) => slugs.includes(guide.slug));
}
