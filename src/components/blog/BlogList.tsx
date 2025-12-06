/**
 * BONO Blog - Blog List Component
 *
 * 99frontend 仕様に基づくブログリストコンポーネント
 *
 * @component BlogList
 * @description ブログ記事のリスト表示コンポーネント。
 *              99frontend仕様では1列表示（リスト最大幅872px）
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types/blog';
import { BlogItem } from './BlogItem';
import { BLOG_SPACING } from '@/styles/design-tokens';

interface BlogListProps {
  /** 表示する記事データの配列 */
  posts: BlogPost[];
  /** リストのバリアント（将来の拡張用） */
  variant?: 'default' | 'compact';
  /** 追加のカスタムクラス名 */
  className?: string;
}

const listContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * BlogList Component
 *
 * 99frontend仕様に準拠したブログリスト。
 * リスト最大幅が872pxで、1列表示。
 *
 * @example
 * ```tsx
 * <BlogList posts={blogPosts} />
 * ```
 */
export const BlogList: React.FC<BlogListProps> = ({
  posts,
  variant = 'default',
  className = '',
}) => {
  // 空状態の処理
  if (!posts || posts.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-16"
        style={{
          maxWidth: BLOG_SPACING.list.maxWidth,
          margin: '0 auto',
        }}
      >
        <p
          className="font-noto text-[#9CA3AF] text-center"
          style={{ fontSize: '16px' }}
        >
          記事が見つかりませんでした。
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center ${className}`}
      style={{
        maxWidth: BLOG_SPACING.list.maxWidth,
        margin: '0 auto',
        gap: BLOG_SPACING.list.gap,
        padding: `0 ${BLOG_SPACING.list.padding.desktop}`,
      }}
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          variants={itemVariants}
          className="w-full flex justify-center"
        >
          <BlogItem post={post} />
        </motion.div>
      ))}

      {/* レスポンシブ用のスタイル */}
      <style>{`
        @media (max-width: 768px) {
          [data-blog-list] {
            padding: 0 ${BLOG_SPACING.list.padding.tablet} !important;
          }
        }

        @media (max-width: 375px) {
          [data-blog-list] {
            padding: 0 ${BLOG_SPACING.list.padding.mobile} !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogList;