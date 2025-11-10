/**
 * BONO Blog - Main Index Page
 *
 * 99frontend 仕様に基づくブログメインページ
 * 参照: blog-pages-implementation-plan.md - Phase 3
 *
 * @page BlogIndex
 * @description ブログのメインページ。99frontend仕様に完全準拠。
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackgroundGradation } from '@/components/blog/BackgroundGradation';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { HeroSection } from '@/components/blog/HeroSection';
import { BlogList } from '@/components/blog/BlogList';
import { Pagination } from '@/components/blog/Pagination';
import { ResponsiveSunDecoration } from '@/components/blog/SunDecoration';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { BlogPostsResponse } from '@/types/blog';

// アニメーション定義
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  out: { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/**
 * BlogIndex Component
 *
 * ブログのメインページ。99frontend仕様に準拠した実装。
 *
 * 構成:
 * - BackgroundGradation（背景）
 * - BlogHeader（ヘッダー）
 * - HeroSection（ヒーローセクション）
 * - BlogList（記事一覧）
 * - Pagination（ページネーション）
 * - Footer（フッター）
 */
const BlogIndex: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogData, setBlogData] = useState<BlogPostsResponse>({
    posts: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0,
      postsPerPage: 9,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  // URLパラメータからページ番号を取得
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // データ取得
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await getBlogPosts({
          page: currentPage,
          limit: 9,
        });
        setBlogData(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
        // エラー時は空データ
        setBlogData({
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalPosts: 0,
            postsPerPage: 9,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [currentPage]);

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    // スムーズスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ページタイトルの設定
  useEffect(() => {
    document.title = 'BONO Blog - HOPE.';
  }, []);

  // ローディングスケルトン
  const LoadingSkeleton = () => (
    <div className="flex flex-col items-center gap-6 py-12">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="w-full max-w-[1120px] h-[159px] bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="relative min-h-screen blog-page"
    >
      {/* SEO設定 */}
      <SEO
        title="BONO Blog - HOPE."
        description="BONOをつくる30代在宅独身男性のクラフト日誌。デザイン、開発、UI/UXに関する記事をお届けします。"
        ogUrl="/blog"
        ogType="blog"
      />

      {/* 背景グラデーション - Fixed, Full Screen, z-index: -10 */}
      <div className="fixed inset-0" style={{ zIndex: -10 }}>
        <BackgroundGradation />
      </div>

      {/* 太陽の装飾 - Fixed, 右下配置, z-index: 0 */}
      <ResponsiveSunDecoration />

      {/* ヘッダー - 高さ 74.07px, z-index: 100 */}
      <BlogHeader />

      {/* ヒーローセクション - 高さ 381px, 背景色 #E8E6EA */}
      <HeroSection />

      {/* メインコンテンツ - padding: 上48px/下48px, z-index: 0 */}
      <main className="relative" style={{ paddingTop: '48px', paddingBottom: '48px', zIndex: 0 }}>
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : blogData.posts.length > 0 ? (
            <>
              {/* BlogList - 中央寄せ, max-width: 1120px, gap: 24px */}
              <BlogList posts={blogData.posts} />

              {/* Pagination - 中央寄せ, margin-top: 48px */}
              {blogData.pagination.totalPages > 1 && (
                <div style={{ marginTop: '48px' }}>
                  <Pagination
                    pagination={blogData.pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            // 記事が見つからない場合
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="font-noto text-2xl font-semibold text-[#0F172A] mb-2">
                記事が見つかりませんでした
              </h3>
              <p className="font-noto text-[#9CA3AF]">
                記事はまだ投稿されていません。
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* フッター */}
      <Footer />
    </motion.div>
  );
};

export default BlogIndex;
