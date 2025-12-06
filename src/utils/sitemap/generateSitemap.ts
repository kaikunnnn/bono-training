// src/utils/sitemap/generateSitemap.ts
import { BlogPost } from '@/types/blog';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapOptions {
  siteUrl: string;
  posts: BlogPost[];
  staticPages?: SitemapUrl[];
}

export const generateSitemap = (options: SitemapOptions): string => {
  const { siteUrl, posts, staticPages = [] } = options;

  // XMLエスケープ用関数
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // 日付をISO 8601形式に変換
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // デフォルトの静的ページ
  const defaultStaticPages: SitemapUrl[] = [
    {
      loc: `${siteUrl}/`,
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: `${siteUrl}/blog`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString().split('T')[0]
    },
    ...staticPages
  ];

  // ブログ記事のURL
  const blogUrls: SitemapUrl[] = posts.map(post => ({
    loc: `${siteUrl}/blog/${post.slug}`,
    lastmod: formatDate(post.publishedAt),
    changefreq: 'monthly' as const,
    priority: 0.8
  }));

  // カテゴリページのURL（重複を避けるためSetを使用）
  const categoryUrls: SitemapUrl[] = Array.from(
    new Set(posts.map(post => post.categorySlug).filter(Boolean))
  ).map(categorySlug => ({
    loc: `${siteUrl}/blog/category/${categorySlug}`,
    changefreq: 'weekly' as const,
    priority: 0.7,
    lastmod: new Date().toISOString().split('T')[0]
  }));

  // 全URLを結合
  const allUrls = [...defaultStaticPages, ...blogUrls, ...categoryUrls];

  // XML生成
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${escapeXML(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// サイトマップインデックス生成（大規模サイト用）
export const generateSitemapIndex = (sitemaps: string[], siteUrl: string): string => {
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemapUrl => `  <sitemap>
    <loc>${escapeXML(`${siteUrl}${sitemapUrl}`)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return sitemapIndex;
};