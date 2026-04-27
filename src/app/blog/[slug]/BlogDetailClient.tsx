"use client";

/**
 * BONO Blog - Blog Detail Page (Client Component)
 *
 * 99frontend 仕様に基づくブログ詳細ページ
 */

import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BackgroundGradation } from '@/components/blog/BackgroundGradation';
import { ResponsiveSunDecoration } from '@/components/blog/SunDecoration';
import { Footer } from '@/components/layout/Footer';
import { BlogPostHeader } from '@/components/blog/BlogPostHeader';
import { PostNavigation } from '@/components/blog/PostNavigation';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogRichText } from '@/components/blog/BlogRichText';
import { BlogPost } from '@/types/blog';
import { removeEmojiFromText } from '@/utils/blog/emojiUtils';
import { useToast } from '@/hooks/use-toast';

// X (Twitter) ロゴ
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
}

const ShareActionButton = ({ icon, label, onClick }: ShareActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-4 py-2 rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
      aria-label={label}
    >
      <span className="text-black">{icon}</span>
      <span className="font-noto-sans-jp font-semibold text-sm text-black">
        {label}
      </span>
    </button>
  );
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
};

interface BlogDetailClientProps {
  post: BlogPost;
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
  latestPosts: BlogPost[];
}

export default function BlogDetailClient({
  post,
  prevPost,
  nextPost,
  latestPosts,
}: BlogDetailClientProps) {
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'コピーしました',
        description: 'URLをクリップボードにコピーしました',
      });
    } catch (err: unknown) {
      console.error('Failed to copy URL:', err);
      toast({
        title: 'コピーに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleShareToX = () => {
    if (!shareUrl || !post?.title) return;
    const tweetText = encodeURIComponent(`${post.title}`);
    const tweetUrl = encodeURIComponent(shareUrl);
    const xShareUrl = `https://x.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(xShareUrl, '_blank', 'width=600,height=400');
  };

  // パンくずリスト（記事タイトルのみ）
  const breadcrumbItems = [
    { label: removeEmojiFromText(post.title) }
  ];

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
            {/* 記事ヘッダー */}
            <BlogPostHeader post={post} />

            {/* 記事コンテンツ */}
            <div className="prose prose-lg max-w-none">
              {/* アイキャッチ画像（プレースホルダーの場合は非表示） */}
              {post.thumbnail && post.thumbnail !== '/placeholder-thumbnail.svg' && (
                <motion.div
                  className="mb-8 w-full rounded-xl overflow-hidden shadow-md"
                  style={{ aspectRatio: '16 / 9' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <img
                    src={post.thumbnail}
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
                  <BlogRichText
                    content={post.content}
                    className="blog-markdown w-full mx-auto lg:max-w-[648px]"
                  />
                ) : (
                  <BlogContent
                    html={post.content}
                    className="blog-markdown w-full mx-auto lg:max-w-[648px]"
                  />
                )}
              </motion.div>
            </div>

            {/* シェアセクション */}
            <motion.div
              className="mt-12 flex flex-col items-center gap-3 px-6 py-8 w-full mx-auto lg:max-w-[648px] bg-[var(--blog-color-white)] rounded-[36px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-600 text-sm font-noto-sans-jp font-semibold">
                よかったらシェアしてね🙋
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <ShareActionButton
                  icon={<Copy size={16} />}
                  label="URLをコピー"
                  onClick={handleCopyShareUrl}
                />
                <ShareActionButton
                  icon={<XIcon className="h-4 w-4" />}
                  label="シェアする"
                  onClick={handleShareToX}
                />
              </div>
            </motion.div>

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
                    href={`/blog/${relatedPost.slug}`}
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
}
