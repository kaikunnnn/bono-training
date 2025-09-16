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
import SEO from '@/components/common/SEO';

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

    const loadPost = async () => {
      setIsLoading(true);
      try {
        const currentPost = await getBlogPostBySlug(slug);
        setPost(currentPost);

        if (currentPost) {
          const [prevPostData, nextPostData] = await Promise.all([
            getPrevPost(currentPost.id),
            getNextPost(currentPost.id)
          ]);

          setPrevPost(prevPostData);
          setNextPost(nextPostData);

          // 実際のコンテンツから見出しを抽出して目次を生成
          const extractTocFromHTML = (html: string) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

            return Array.from(headings).map((heading, index) => ({
              id: heading.id || `heading-${index}`,
              text: heading.textContent || '',
              level: parseInt(heading.tagName.charAt(1))
            }));
          };

          const tocItems = extractTocFromHTML(currentPost.content);
          setTocItems(tocItems);
        }
      } catch (error) {
        console.error(`Failed to load post with slug ${slug}:`, error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
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

  // 構造化データ（JSON-LD）for Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.description,
    "image": post.imageUrl || post.thumbnail,
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "BONO Training",
      "logo": {
        "@type": "ImageObject",
        "url": `${import.meta.env.VITE_SITE_URL || 'http://localhost:8080'}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${import.meta.env.VITE_SITE_URL || 'http://localhost:8080'}/blog/${post.slug}`
    }
  };

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
        title={post.title}
        description={post.excerpt || post.description}
        ogTitle={post.title}
        ogDescription={post.excerpt || post.description}
        ogImage={post.imageUrl || post.thumbnail}
        ogUrl={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={articleJsonLd}
      />

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
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
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