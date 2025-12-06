// src/hooks/useRSSFeed.ts
import { useState, useCallback } from 'react';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { generateRSSFeed } from '@/utils/rss/generateRSS';

export const useRSSFeed = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadRSS = useCallback(async () => {
    setIsGenerating(true);

    try {
      // ブログ記事を取得
      const blogData = await getBlogPosts({ limit: 50 });

      const rssOptions = {
        title: 'BONO Training Blog',
        description: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のトレーニングブログ',
        siteUrl: import.meta.env.VITE_SITE_URL || window.location.origin,
        feedUrl: `${import.meta.env.VITE_SITE_URL || window.location.origin}/rss.xml`,
        posts: blogData.posts
      };

      // RSSフィード生成
      const rssFeed = generateRSSFeed(rssOptions);

      // Blobを作成してダウンロードリンクを生成
      const blob = new Blob([rssFeed], { type: 'application/rss+xml; charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // RSSファイルとしてダウンロード
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rss.xml';
      link.click();

      // メモリクリーンアップ
      URL.revokeObjectURL(url);

      return rssFeed;
    } catch (error) {
      console.error('Failed to generate RSS feed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getRSSUrl = useCallback(async () => {
    try {
      // ブログ記事を取得
      const blogData = await getBlogPosts({ limit: 50 });

      const rssOptions = {
        title: 'BONO Training Blog',
        description: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のトレーニングブログ',
        siteUrl: import.meta.env.VITE_SITE_URL || window.location.origin,
        feedUrl: `${import.meta.env.VITE_SITE_URL || window.location.origin}/rss.xml`,
        posts: blogData.posts
      };

      // RSSフィード生成
      const rssFeed = generateRSSFeed(rssOptions);

      // Blobを作成してURLを生成
      const blob = new Blob([rssFeed], { type: 'application/rss+xml; charset=utf-8' });
      const url = URL.createObjectURL(blob);

      return url;
    } catch (error) {
      console.error('Failed to generate RSS URL:', error);
      throw error;
    }
  }, []);

  return {
    generateAndDownloadRSS,
    getRSSUrl,
    isGenerating
  };
};