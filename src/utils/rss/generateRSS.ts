// src/utils/rss/generateRSS.ts
import { BlogPost } from '@/types/blog';

interface RSSOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  posts: BlogPost[];
}

export const generateRSSFeed = (options: RSSOptions): string => {
  const {
    title,
    description,
    siteUrl,
    feedUrl,
    language = 'ja-JP',
    copyright = `© ${new Date().getFullYear()} BONO Training`,
    managingEditor = 'admin@bono-training.com',
    webMaster = 'admin@bono-training.com',
    posts
  } = options;

  // XMLエスケープ用関数
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // CDATA でHTMLコンテンツをラップ
  const wrapCDATA = (str: string): string => {
    return `<![CDATA[${str}]]>`;
  };

  // RFC822形式の日付に変換
  const toRFC822Date = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toUTCString();
  };

  // RSS 2.0 フォーマット
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(title)}</title>
    <description>${escapeXML(description)}</description>
    <link>${escapeXML(siteUrl)}</link>
    <atom:link href="${escapeXML(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    <copyright>${escapeXML(copyright)}</copyright>
    <lastBuildDate>${toRFC822Date(new Date().toISOString())}</lastBuildDate>
    <managingEditor>${escapeXML(managingEditor)}</managingEditor>
    <webMaster>${escapeXML(webMaster)}</webMaster>
    <generator>BONO Training RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    ${posts.map(post => `
    <item>
      <title>${escapeXML(post.title)}</title>
      <link>${escapeXML(`${siteUrl}/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${escapeXML(`${siteUrl}/blog/${post.slug}`)}</guid>
      <description>${escapeXML(post.excerpt || post.description || '')}</description>
      <content:encoded>${wrapCDATA(post.content || '')}</content:encoded>
      <dc:creator>${escapeXML(post.author || 'Unknown')}</dc:creator>
      <pubDate>${toRFC822Date(post.publishedAt)}</pubDate>
      ${post.category ? `<category>${escapeXML(post.category)}</category>` : ''}
      ${post.tags?.map(tag => `<category>${escapeXML(tag)}</category>`).join('\n      ') || ''}
      ${post.thumbnail && post.thumbnail !== '/blog/images/default.jpg' ? `
      <enclosure url="${escapeXML(post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`)}" type="image/jpeg" />` : ''}
    </item>`).join('')}
  </channel>
</rss>`;

  return rss;
};

// Atom 1.0フィード生成（オプション）
export const generateAtomFeed = (options: RSSOptions): string => {
  const {
    title,
    description,
    siteUrl,
    feedUrl,
    posts
  } = options;

  // XMLエスケープ用関数
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXML(title)}</title>
  <subtitle>${escapeXML(description)}</subtitle>
  <link href="${escapeXML(feedUrl)}" rel="self" type="application/atom+xml" />
  <link href="${escapeXML(siteUrl)}" rel="alternate" type="text/html" />
  <id>${escapeXML(siteUrl)}</id>
  <updated>${new Date().toISOString()}</updated>
  <generator>BONO Training Atom Generator</generator>
  ${posts.map(post => `
  <entry>
    <title>${escapeXML(post.title)}</title>
    <link href="${escapeXML(`${siteUrl}/blog/${post.slug}`)}" rel="alternate" type="text/html" />
    <id>${escapeXML(`${siteUrl}/blog/${post.slug}`)}</id>
    <published>${new Date(post.publishedAt).toISOString()}</published>
    <updated>${new Date(post.publishedAt).toISOString()}</updated>
    <author>
      <name>${escapeXML(post.author || 'Unknown')}</name>
    </author>
    <summary type="text">${escapeXML(post.excerpt || post.description || '')}</summary>
    <content type="html">${escapeXML(post.content || '')}</content>
    ${post.category ? `<category term="${escapeXML(post.category)}" />` : ''}
    ${post.tags?.map(tag => `<category term="${escapeXML(tag)}" />`).join('\n    ') || ''}
  </entry>`).join('')}
</feed>`;

  return atom;
};