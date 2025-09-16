// src/pages/blog/category.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BlogList } from '@/components/blog/BlogList';
import { Pagination } from '@/components/blog/Pagination';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { categories } from '@/data/blog/categories';
import { BlogPostsResponse } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

const CategoryPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
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
  const [isLoading, setIsLoading] = useState(true);

  // カテゴリ情報を取得
  const category = categories.find(c => c.slug === categorySlug);

  // URLパラメータからページ番号を取得
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // データ取得
  useEffect(() => {
    if (!categorySlug) return;

    setIsLoading(true);

    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await getBlogPosts({
          page: currentPage,
          category: categorySlug,
          limit: 9
        });
        setBlogData(data);
      } catch (error) {
        console.error('Failed to load category posts:', error);
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
  }, [currentPage, categorySlug]);

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

  // カテゴリが見つからない場合
  if (!category) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        className="min-h-screen bg-Top"
      >
        <Header />
        <main className="container pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center py-16">
            <div className="text-6xl mb-4">🏷️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              カテゴリが見つかりませんでした
            </h1>
            <p className="text-gray-600 mb-8">
              お探しのカテゴリは存在しないか、削除された可能性があります。
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ブログ一覧に戻る
            </Link>
          </div>
        </main>
        <Footer />
      </motion.div>
    );
  }

  const breadcrumbItems = [
    { label: 'ブログ', href: '/blog' },
    { label: category.name }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-Top"
    >
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* パンくずリスト */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
          </motion.div>

          {/* カテゴリタイトルセクション */}
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex justify-center items-center mb-6">
              <Badge
                className={`${category.color} text-white text-lg px-4 py-2 rounded-full`}
              >
                {category.name}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold !leading-normal mb-4 text-gray-900">
              {category.name}の記事
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
          </motion.div>

          {/* 記事数表示 */}
          {!isLoading && (
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-600">
                {blogData.pagination.totalPosts}件の記事が見つかりました
              </p>
            </motion.div>
          )}

          {/* コンテンツエリア */}
          <div className="w-full md:w-11/12 lg:w-10/12 mx-auto">
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
                  <p className="text-gray-600 mb-6">
                    「{category.name}」カテゴリの記事はまだありません。
                  </p>
                  <Link
                    to="/blog"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    すべての記事を表示
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ブログ一覧に戻るボタン */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ブログ一覧に戻る
            </Link>
          </motion.div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </motion.div>
  );
};

export default CategoryPage;