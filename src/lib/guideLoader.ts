import yaml from 'js-yaml';
import type { Guide, GuideCategory } from '@/types/guide';

/**
 * Frontmatterとmarkdownを分離
 */
function parseFrontmatter(content: string): { frontmatter: any; markdown: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  const frontmatter = yaml.load(match[1]);
  const markdown = match[2];

  return { frontmatter, markdown };
}

/**
 * パスからslugを抽出
 * 例: /content/guide/career/job-change-roadmap/index.md → job-change-roadmap
 */
function extractSlugFromPath(path: string): string {
  const parts = path.split('/');
  // index.mdの一つ前のディレクトリ名がslug
  return parts[parts.length - 2];
}

/**
 * すべてのガイド記事を取得
 */
export async function loadGuides(): Promise<Guide[]> {
  try {
    // Viteのimport.meta.globでMarkdownファイルを読み込み
    const modules = import.meta.glob('/content/guide/**/index.md', {
      as: 'raw',
      eager: true,
    });

    const guides: Guide[] = [];

    for (const [path, content] of Object.entries(modules)) {
      try {
        const { frontmatter, markdown } = parseFrontmatter(content as string);
        const slug = extractSlugFromPath(path);

        const guide: Guide = {
          title: frontmatter.title,
          description: frontmatter.description,
          slug: slug,
          category: frontmatter.category as GuideCategory,
          tags: frontmatter.tags || [],
          thumbnail: frontmatter.thumbnail,
          icon: frontmatter.icon,
          order_index: frontmatter.order_index || 999,
          author: frontmatter.author || 'BONO',
          publishedAt: frontmatter.publishedAt,
          updatedAt: frontmatter.updatedAt,
          readingTime: frontmatter.readingTime,
          isPremium: frontmatter.isPremium || false,
          seo: frontmatter.seo,
          relatedGuides: frontmatter.relatedGuides || [],
          content: markdown,
        };

        guides.push(guide);
      } catch (error) {
        console.error(`Error parsing guide at ${path}:`, error);
      }
    }

    // order_indexでソート
    return guides.sort((a, b) => a.order_index - b.order_index);
  } catch (error) {
    console.error('Error loading guides:', error);
    return [];
  }
}

/**
 * slugで特定のガイド記事を取得
 */
export async function loadGuide(slug: string): Promise<Guide | null> {
  const guides = await loadGuides();
  return guides.find((guide) => guide.slug === slug) || null;
}

/**
 * カテゴリで絞り込んだガイド記事を取得
 */
export async function loadGuidesByCategory(category: GuideCategory): Promise<Guide[]> {
  const guides = await loadGuides();
  return guides.filter((guide) => guide.category === category);
}
