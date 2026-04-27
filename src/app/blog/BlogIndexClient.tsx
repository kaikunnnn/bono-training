"use client";

/**
 * BONO Blog - Main Index Page (Client Component)
 *
 * 99frontend 仕様に基づくブログメインページ
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BackgroundGradation } from '@/components/blog/BackgroundGradation';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { HeroSection } from '@/components/blog/HeroSection';
import { BlogList } from '@/components/blog/BlogList';
import { Pagination } from '@/components/blog/Pagination';
import { ResponsiveSunDecoration } from '@/components/blog/SunDecoration';
import { Footer } from '@/components/layout/Footer';
import { BlogPost, BlogPagination } from '@/types/blog';

// アニメーション定義
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
  out: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

interface BlogIndexClientProps {
  initialPosts: BlogPost[];
  initialPagination: BlogPagination;
  currentPage: number;
}

export default function BlogIndexClient({
  initialPosts,
  initialPagination,
  currentPage,
}: BlogIndexClientProps) {
  const router = useRouter();

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    router.push(`/blog?page=${page}`);
    // スムーズスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          {initialPosts.length > 0 ? (
            <>
              {/* BlogList - 中央寄せ, max-width: 1120px, gap: 24px */}
              <BlogList posts={initialPosts} />

              {/* Pagination - 中央寄せ, margin-top: 48px */}
              {initialPagination.totalPages > 1 && (
                <div style={{ marginTop: '48px' }}>
                  <Pagination
                    pagination={initialPagination}
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
}
