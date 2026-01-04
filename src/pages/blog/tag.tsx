/**
 * BONO Blog - Tag Detail Page
 *
 * 特定タグの記事一覧ページ
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackgroundGradation } from '@/components/blog/BackgroundGradation';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogList } from '@/components/blog/BlogList';
import { Pagination } from '@/components/blog/Pagination';
import { ResponsiveSunDecoration } from '@/components/blog/SunDecoration';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { fetchGhostPostsByCategory } from '@/services/ghostService';
import { BlogPostsResponse } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  out: { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};

const TagDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    if (!slug) return;

    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGhostPostsByCategory(slug, {
          page: currentPage,
          limit: 9,
        });
        setBlogData(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
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
  }, [slug, currentPage]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // タグ名を表示用にフォーマット（最初の文字を大文字に）
  const tagName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';

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
      <SEO
        title={`${tagName} の記事一覧 - BONO Blog`}
        description={`BONO Blogの「${tagName}」タグの記事一覧です。`}
        ogUrl={`/blog/tag/${slug}`}
        ogType="website"
      />

      {/* 背景グラデーション */}
      <div className="fixed inset-0" style={{ zIndex: -10 }}>
        <BackgroundGradation />
      </div>

      {/* 太陽の装飾 */}
      <ResponsiveSunDecoration />

      {/* ヘッダー */}
      <BlogHeader />

      {/* メインコンテンツ */}
      <main className="relative" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        {/* ページタイトル */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-2 bg-white/80 rounded-full border border-gray-200 mb-4">
            <span className="text-sm text-gray-500">タグ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {tagName}
          </h1>
          <p className="text-gray-600">
            {blogData.pagination.totalPosts} 件の記事
          </p>
        </motion.div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : blogData.posts.length > 0 ? (
          <>
            <BlogList posts={blogData.posts} />

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
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              記事が見つかりませんでした
            </h3>
            <p className="text-gray-500">
              このタグの記事はまだありません。
            </p>
          </motion.div>
        )}
      </main>

      <Footer />
    </motion.div>
  );
};

export default TagDetail;
