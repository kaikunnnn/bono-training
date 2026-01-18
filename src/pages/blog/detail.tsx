// src/pages/blog/detail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BackgroundGradation } from '@/components/blog/BackgroundGradation';
import { ResponsiveSunDecoration } from '@/components/blog/SunDecoration';
import Footer from '@/components/layout/Footer';
import { BlogPostHeader } from '@/components/blog/BlogPostHeader';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { PostNavigation } from '@/components/blog/PostNavigation';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogRichText } from '@/components/blog/BlogRichText';
import { getBlogPostBySlug, getNextPost, getPrevPost, getLatestPosts } from '@/utils/blog/blogUtils';
import { BlogPost } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/common/SEO';
import { removeEmojiFromText } from '@/utils/blog/emojiUtils';

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
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
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
          const [prevPostData, nextPostData, latestPostsData] = await Promise.all([
            getPrevPost(currentPost.id),
            getNextPost(currentPost.id),
            getLatestPosts(currentPost.id, 4)
          ]);

          setPrevPost(prevPostData);
          setNextPost(nextPostData);
          setLatestPosts(latestPostsData);

          // 実際のコンテンツから見出しを抽出して目次を生成
          const extractToc = (content: BlogPost['content']) => {
            // Portable Text
            if (Array.isArray(content)) {
              const items: Array<{ id: string; text: string; level: number }> = []
              let idx = 0
              for (const b of content) {
                if ((b as any)?._type !== 'block') continue
                const style = (b as any)?.style
                if (!style || style === 'normal') continue
                const level = typeof style === 'string' && /^h[1-6]$/.test(style) ? parseInt(style.charAt(1)) : 0
                if (!level) continue
                const text = ((b as any)?.children ?? []).map((c: any) => c?.text ?? '').join('')
                items.push({ id: (b as any)?._key || `heading-${idx}`, text, level })
                idx += 1
              }
              return items
            }

            // HTML
            const parser = new DOMParser()
            const doc = parser.parseFromString(content || '', 'text/html')
            const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
            return Array.from(headings).map((heading, index) => ({
              id: heading.id || `heading-${index}`,
              text: heading.textContent || '',
              level: parseInt(heading.tagName.charAt(1)),
            }))
          }

          setTocItems(extractToc(currentPost.content))
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
        className="min-h-screen relative"
      >
        {/* 背景グラデーション */}
        <div className="fixed inset-0" style={{ zIndex: -10 }}>
          <BackgroundGradation />
        </div>

        {/* 太陽の装飾 */}
        <ResponsiveSunDecoration />

        <BlogHeader />
        <main className="container pb-16">
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
        className="min-h-screen relative"
      >
        {/* 背景グラデーション */}
        <div className="fixed inset-0" style={{ zIndex: -10 }}>
          <BackgroundGradation />
        </div>

        {/* 太陽の装飾 */}
        <ResponsiveSunDecoration />

        <BlogHeader />
        <main className="container pb-16">
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
              ブログ一覧へ
            </Link>
          </div>
        </main>
        <Footer />
      </motion.div>
    );
  }

  // パンくずリスト（記事タイトルのみ）
  const breadcrumbItems = [
    { label: removeEmojiFromText(post.title) }
  ];

  // OGP用の画像URL（Ghost CMSのfeature_imageを優先）
  const getOgImage = () => {
    // Ghost CMSのfeature_image（thumbnail）を最優先
    if (post.thumbnail && post.thumbnail !== '/placeholder-thumbnail.svg') {
      return post.thumbnail;
    }
    // 次にimageUrlをチェック
    if (post.imageUrl) {
      return post.imageUrl;
    }
    // フォールバック: デフォルトOG画像
    return '/og-default.svg';
  };

  // 構造化データ（JSON-LD）for Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": removeEmojiFromText(post.title),
    "description": post.description || post.excerpt,
    "image": getOgImage(),
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
    },
    "keywords": post.tags?.join(', ')
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen relative"
    >
      {/* SEO設定（Ghost CMSデータと連携） */}
      <SEO
        title={removeEmojiFromText(post.title)}
        description={post.description || post.excerpt}
        keywords={post.tags?.join(', ')}
        author={post.author}
        ogTitle={removeEmojiFromText(post.title)}
        ogDescription={post.description || post.excerpt}
        ogImage={getOgImage()}
        ogUrl={`/blog/${post.slug}`}
        ogType="article"
        twitterCard="summary_large_image"
        jsonLd={articleJsonLd}
      />

      {/* 背景グラデーション */}
      <div className="fixed inset-0" style={{ zIndex: -10 }}>
        <BackgroundGradation />
      </div>

      {/* 太陽の装飾 */}
      <ResponsiveSunDecoration />

      <BlogHeader />

      <main className="container pb-16">
        <div className="max-w-4xl mx-auto">
          {/* パンくずリスト */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
          </motion.div>

          {/* メインコンテンツ */}
          <motion.article
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* 目次 */}
            <TableOfContents items={tocItems} />

            {/* 記事ヘッダー */}
            <BlogPostHeader post={post} />

            {/* 記事コンテンツ */}
            <div className="prose prose-lg max-w-none">
              {/* アイキャッチ画像 */}
              {post.imageUrl && (
                <motion.div
                  className="mb-8 w-full rounded-xl overflow-hidden shadow-md"
                  style={{ aspectRatio: '16 / 9' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* 記事本文（Bookmark カード対応） */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {Array.isArray(post.content) ? (
                  <BlogRichText content={post.content} className="blog-markdown max-w-[720px] mx-auto" />
                ) : (
                  <BlogContent html={post.content} className="blog-markdown max-w-[720px] mx-auto" />
                )}
              </motion.div>
            </div>

          </motion.article>

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

      {/* 関連記事（最新4件） - 独立ブロック */}
      {latestPosts.length > 0 && (
        <section className="border-t">
          <motion.div
            className="container py-12 md:py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                最新の記事
              </h2>
              <p className="text-gray-600 text-center mb-8">
                こちらもよかったらどぞっ🍕
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group block bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* 絵文字サムネイル */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-2xl">
                        {relatedPost.emoji || '📝'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {removeEmojiFromText(relatedPost.title)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(relatedPost.publishedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      <Footer />
    </motion.div>
  );
};

export default BlogDetail;