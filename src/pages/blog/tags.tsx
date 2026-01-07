/**
 * BONO Blog - Tags Index Page
 *
 * タグ一覧ページ
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackgroundGradation } from '@/components/blog/BackgroundGradation';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { ResponsiveSunDecoration } from '@/components/blog/SunDecoration';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/common/SEO';
import { fetchGhostTags, GhostTag } from '@/services/ghostService';
import { Skeleton } from '@/components/ui/skeleton';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  out: { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};

const TagsIndex: React.FC = () => {
  const [tags, setTags] = useState<GhostTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGhostTags();
        // 記事数が0より多いタグのみ表示し、記事数順にソート
        const filteredTags = data
          .filter(tag => (tag.count?.posts || 0) > 0)
          .sort((a, b) => (b.count?.posts || 0) - (a.count?.posts || 0));
        setTags(filteredTags);
      } catch (error) {
        console.error('Failed to load tags:', error);
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, []);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
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
        title="タグ一覧 - BONO Blog"
        description="BONO Blogのタグ一覧ページ。カテゴリ別に記事を探せます。"
        ogUrl="/blog/tags"
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
      <main className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* ページタイトル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              タグ一覧
            </h1>
            <p className="text-gray-600">
              興味のあるタグをクリックして記事を探す
            </p>
          </motion.div>

          {/* タグ一覧 */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : tags.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {tags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={`/blog/tag/${tag.slug}`}
                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100"
                  >
                    <h2 className="font-bold text-gray-900 mb-2 truncate">
                      {tag.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {tag.count?.posts || 0} 件の記事
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                タグがありません
              </h3>
              <p className="text-gray-500">
                まだタグが作成されていません。
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default TagsIndex;
