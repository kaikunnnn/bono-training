// src/scripts/generateFeeds.ts
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { generateRSSFeed, generateAtomFeed } from '@/utils/rss/generateRSS';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.VITE_SITE_URL || 'http://localhost:8080';

export async function generateStaticFeeds() {
  try {
    // すべてのブログ記事を取得
    const blogData = await getBlogPosts({ limit: 50 }); // 最新50記事

    const rssOptions = {
      title: 'BONO Training Blog',
      description: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のトレーニングブログ',
      siteUrl: SITE_URL,
      feedUrl: `${SITE_URL}/rss.xml`,
      posts: blogData.posts
    };

    // RSS 2.0フィード生成
    const rssFeed = generateRSSFeed(rssOptions);

    // Atomフィード生成
    const atomOptions = {
      ...rssOptions,
      feedUrl: `${SITE_URL}/atom.xml`
    };
    const atomFeed = generateAtomFeed(atomOptions);

    // publicディレクトリに書き込み
    const publicDir = path.join(process.cwd(), 'public');

    fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssFeed, 'utf-8');
    fs.writeFileSync(path.join(publicDir, 'atom.xml'), atomFeed, 'utf-8');

    console.log('✅ RSS and Atom feeds generated successfully');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to generate feeds:', error);
    return { success: false, error };
  }
}

// CLIから実行する場合
if (require.main === module) {
  generateStaticFeeds();
}