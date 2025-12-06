// src/pages/api/RSSFeed.tsx
import { useEffect } from 'react';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { generateRSSFeed } from '@/utils/rss/generateRSS';

const RSSFeed: React.FC = () => {
  useEffect(() => {
    const generateAndServeRSS = async () => {
      try {
        // ブログ記事を取得
        const blogData = await getBlogPosts({ limit: 50 });

        const rssOptions = {
          title: 'BONO Training Blog',
          description: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のトレーニングブログ',
          siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:8080',
          feedUrl: `${import.meta.env.VITE_SITE_URL || 'http://localhost:8080'}/rss`,
          posts: blogData.posts
        };

        // RSSフィード生成
        const rssFeed = generateRSSFeed(rssOptions);

        // XMLとして出力
        const blob = new Blob([rssFeed], { type: 'application/rss+xml; charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // ブラウザで直接XMLを表示
        window.location.href = url;
      } catch (error) {
        console.error('Failed to generate RSS feed:', error);
      }
    };

    generateAndServeRSS();
  }, []);

  return <div>Generating RSS feed...</div>;
};

export default RSSFeed;