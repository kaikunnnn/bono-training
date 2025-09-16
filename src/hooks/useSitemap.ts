// src/hooks/useSitemap.ts
import { useState, useCallback } from 'react';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { generateSitemap } from '@/utils/sitemap/generateSitemap';

export const useSitemap = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadSitemap = useCallback(async () => {
    setIsGenerating(true);

    try {
      // ブログ記事を取得
      const blogData = await getBlogPosts({ limit: 1000 }); // 全記事を取得

      const sitemapOptions = {
        siteUrl: import.meta.env.VITE_SITE_URL || window.location.origin,
        posts: blogData.posts,
        staticPages: [
          // 必要に応じて追加の静的ページを定義
          // {
          //   loc: `${import.meta.env.VITE_SITE_URL || window.location.origin}/about`,
          //   changefreq: 'monthly' as const,
          //   priority: 0.6
          // }
        ]
      };

      // サイトマップ生成
      const sitemap = generateSitemap(sitemapOptions);

      // Blobを作成してダウンロードリンクを生成
      const blob = new Blob([sitemap], { type: 'application/xml; charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // XMLファイルとしてダウンロード
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      link.click();

      // メモリクリーンアップ
      URL.revokeObjectURL(url);

      return sitemap;
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getSitemapUrl = useCallback(async () => {
    try {
      // ブログ記事を取得
      const blogData = await getBlogPosts({ limit: 1000 });

      const sitemapOptions = {
        siteUrl: import.meta.env.VITE_SITE_URL || window.location.origin,
        posts: blogData.posts
      };

      // サイトマップ生成
      const sitemap = generateSitemap(sitemapOptions);

      // Blobを作成してURLを生成
      const blob = new Blob([sitemap], { type: 'application/xml; charset=utf-8' });
      const url = URL.createObjectURL(blob);

      return url;
    } catch (error) {
      console.error('Failed to generate sitemap URL:', error);
      throw error;
    }
  }, []);

  return {
    generateAndDownloadSitemap,
    getSitemapUrl,
    isGenerating
  };
};