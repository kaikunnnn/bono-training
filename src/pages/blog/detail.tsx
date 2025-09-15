// src/pages/blog/detail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BlogPostHeader } from '@/components/blog/BlogPostHeader';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { PostNavigation } from '@/components/blog/PostNavigation';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { getBlogPostBySlug, getNextPost, getPrevPost } from '@/utils/blog/blogUtils';
import { categories } from '@/data/blog/categories';
import { BlogPost } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
  const [nextPost, setNextPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tocItems, setTocItems] = useState<Array<{id: string, text: string, level: number}>>([]);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);

    // 実際のAPIコールをシミュレート（遅延を追加）
    const timer = setTimeout(() => {
      const currentPost = getBlogPostBySlug(slug);
      setPost(currentPost);

      if (currentPost) {
        setPrevPost(getPrevPost(currentPost.id));
        setNextPost(getNextPost(currentPost.id));

        // 目次の生成（実際のコンテンツから見出しを抽出する想定）
        const mockTocItems = [
          { id: 'introduction', text: 'はじめに', level: 2 },
          { id: 'main-content', text: 'メインコンテンツ', level: 2 },
          { id: 'sub-section-1', text: 'サブセクション1', level: 3 },
          { id: 'sub-section-2', text: 'サブセクション2', level: 3 },
          { id: 'conclusion', text: 'まとめ', level: 2 }
        ];
        setTocItems(mockTocItems);
      }

      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [slug]);

  // ローディングスケルトン
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );

  if (isLoading) {
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
          <div className="max-w-4xl mx-auto">
            <LoadingSkeleton />
          </div>
        </main>
        <Footer />
      </motion.div>
    );
  }

  if (!post) {
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
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              記事が見つかりませんでした
            </h1>
            <p className="text-gray-600 mb-8">
              お探しの記事は存在しないか、削除された可能性があります。
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

  const category = categories.find(c => c.slug === post.categorySlug);
  const breadcrumbItems = [
    { label: 'ブログ', href: '/blog' },
    { label: post.title }
  ];

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
        <div className="max-w-4xl mx-auto">
          {/* パンくずリスト */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* メインコンテンツ */}
            <motion.article
              className="lg:col-span-3 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* 記事ヘッダー */}
              <BlogPostHeader post={post} />

              {/* メタ情報 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}分で読める
                </div>
                {category && (
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    <Badge
                      variant="secondary"
                      className={`${category.color} text-white`}
                    >
                      {category.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* 記事コンテンツ */}
              <div className="prose prose-lg max-w-none">
                {/* アイキャッチ画像 */}
                {post.imageUrl && (
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md"
                    />
                  </motion.div>
                )}

                {/* 記事本文 */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div id="introduction">
                    <h2>はじめに</h2>
                    <p>{post.excerpt}</p>
                    <p>この記事では、{post.title}について詳しく解説していきます。実際の開発現場で使える実践的な内容を中心に、基礎から応用まで幅広くカバーしています。</p>
                  </div>

                  <div id="main-content">
                    <h2>メインコンテンツ</h2>
                    <p>ここからが本編です。実際のコード例や具体的な実装方法について詳しく見ていきましょう。</p>

                    <div id="sub-section-1">
                      <h3>サブセクション1</h3>
                      <p>具体的な実装例を交えながら、ステップバイステップで説明していきます。</p>
                      <pre><code>{`// サンプルコード
const example = () => {
  console.log('Hello, World!');
};`}</code></pre>
                    </div>

                    <div id="sub-section-2">
                      <h3>サブセクション2</h3>
                      <p>より高度なテクニックや応用例についても触れていきます。</p>
                    </div>
                  </div>

                  <div id="conclusion">
                    <h2>まとめ</h2>
                    <p>今回は{post.title}について解説しました。この知識を活用して、より良い開発体験を実現してください。</p>
                  </div>
                </motion.div>
              </div>

              {/* タグ */}
              {post.tags && post.tags.length > 0 && (
                <motion.div
                  className="pt-6 border-t border-gray-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-3">タグ:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* シェアボタン */}
              <motion.div
                className="pt-6 border-t border-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <ShareButtons
                  url={`/blog/${post.slug}`}
                  title={post.title}
                  description={post.excerpt}
                />
              </motion.div>
            </motion.article>

            {/* サイドバー */}
            <motion.aside
              className="lg:col-span-1 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* 目次 */}
              <div className="sticky top-24">
                <TableOfContents
                  items={tocItems}
                  className="mb-8"
                />

                {/* ブログ一覧に戻るボタン */}
                <Link
                  to="/blog"
                  className="block w-full text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  ブログ一覧に戻る
                </Link>
              </div>
            </motion.aside>
          </div>

          {/* 前後の記事ナビゲーション */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <PostNavigation
              prevPost={prevPost}
              nextPost={nextPost}
            />
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default BlogDetail;