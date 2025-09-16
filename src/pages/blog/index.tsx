// src/pages/blog/index.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BlogList } from '@/components/blog/BlogList';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { Pagination } from '@/components/blog/Pagination';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { categories } from '@/data/blog/categories';
import { BlogPostsResponse } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/common/SEO';
import { useRSSFeed } from '@/hooks/useRSSFeed';
import { useSitemap } from '@/hooks/useSitemap';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

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
      hasPrevPage: false
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // RSS フィード用フック
  const { generateAndDownloadRSS, isGenerating } = useRSSFeed();

  // サイトマップ用フック
  const { generateAndDownloadSitemap, isGenerating: isSitemapGenerating } = useSitemap();

  // URLパラメータからページ番号を取得
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // データ取得
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await getBlogPosts({
          page: currentPage,
          category: selectedCategory || undefined,
          limit: 9
        });
        setBlogData(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
        // エラー時はmockデータにフォールバック
        setBlogData({
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalPosts: 0,
            postsPerPage: 9,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, selectedCategory]);

  // カテゴリ変更ハンドラ
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    // カテゴリ変更時は1ページ目に戻る
    setSearchParams({ page: '1' });
  };

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    // スムーズスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ローディングスケルトン
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-Top"
    >
      {/* SEO設定 */}
      <SEO
        title="ブログ"
        description="BONOトレーニングのブログ記事一覧。デザイン、開発、UI/UXに関する最新の記事をお届けします。"
        ogUrl="/blog"
        ogType="blog"
      />

      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="container pt-24 pb-16">
        {/* ページタイトルセクション */}
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold !leading-normal mb-4 text-gray-900">
            ブログ
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            最新の記事をお届けします
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={generateAndDownloadRSS}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  RSS生成中...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.429 2.667v2.667c6.667 0 12 5.333 12 12h2.667c0-8-6.667-14.667-14.667-14.667zM3.429 8v2.667c3.333 0 6 2.667 6 6h2.667c0-4.667-3.833-8.667-8.667-8.667zM6.095 13.333c0 1.467-1.2 2.667-2.667 2.667s-2.667-1.2-2.667-2.667 1.2-2.667 2.667-2.667 2.667 1.2 2.667 2.667z"/>
                  </svg>
                  RSSフィード
                </span>
              )}
            </button>
            <button
              onClick={generateAndDownloadSitemap}
              disabled={isSitemapGenerating}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSitemapGenerating ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  サイトマップ生成中...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  サイトマップ
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* コンテンツエリア */}
        <div className="w-full md:w-11/12 lg:w-10/12 mx-auto">
          {/* カテゴリフィルター */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </motion.div>

          {/* 記事一覧またはローディング */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : blogData.posts.length > 0 ? (
              <>
                <BlogList posts={blogData.posts} />

                {/* ページネーション */}
                {blogData.pagination.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Pagination
                      pagination={blogData.pagination}
                      onPageChange={handlePageChange}
                    />
                  </motion.div>
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
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  記事が見つかりませんでした
                </h3>
                <p className="text-gray-600">
                  {selectedCategory ?
                    `「${categories.find(c => c.slug === selectedCategory)?.name}」カテゴリの記事はまだありません。` :
                    '記事はまだ投稿されていません。'
                  }
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className="mt-4 text-blue-600 hover:text-blue-700 underline"
                  >
                    すべての記事を表示
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </motion.div>
  );
};

export default BlogIndex;