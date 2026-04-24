// src/components/blog/BlogCard.tsx — mainからコピー＋最小変更
"use client";

import { motion } from "framer-motion";
import { BlogPost } from "@/types/blog";
import Link from "next/link";
import { categories } from "@/data/blog/categories";
import { removeEmojiFromText } from "@/utils/blog/emojiUtils";

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured';
  index?: number;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const,
    }
  }
};

// カテゴリ背景色のマッピング
const categoryBgColors: Record<string, string> = {
  tweet: 'bg-tweet',
  book: 'bg-book',
  bono: 'bg-bono',
  output: 'bg-output',
};

export const BlogCard: React.FC<BlogCardProps> = ({ post, variant = "default", index = 0 }) => {
  // カテゴリ情報を取得
  const category = categories.find(cat => cat.slug === post.category);
  const categoryBgColor = categoryBgColors[post.category] || 'bg-gray-400';

  return (
    <Link href={`/blog/${post.slug}`} className="hover:opacity-80">
      <motion.li
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.01 }}
        transition={{ delay: index * 0.05 }}
        className="hover:bg-gray-100 bg-white rounded-2xl p-3 md:p-3 pr-3 md:pr-6 min-h-full shadow-sm list-none"
      >
        <div className="flex content-between items-center gap-3 md:gap-8">
          {/* 画像セクション */}
          <div className={`flex items-center justify-center content ${categoryBgColor} w-4/12 md:w-4/12 h-full md:h-32 py-10 rounded-xl`}>
            <img
              alt="emoji Image"
              loading="lazy"
              width="48"
              height="48"
              className="md:w-16 md:h-16 w-8 h-8"
              src={post.thumbnail}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="text-2xl md:text-4xl">📝</div>';
              }}
            />
          </div>

          {/* テキストセクション */}
          <div className="w-8/12 flex flex-col gap-1 md:gap-2">
            <h4 className="text-lg md:text-base text-slate-900 font-bold text-left line-clamp-2">
              {removeEmojiFromText(post.title)}
            </h4>
            <div className="flex gap-3">
              <span className="text-xs text-left text-gray-400">
                {category?.name || post.category.toUpperCase()}
              </span>
              <time className="text-xs text-left text-gray-400">
                {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\//g, '年').replace(/年(\d{2})年/, '年$1月').replace(/月(\d{2})$/, '月$1日')}
              </time>
            </div>
          </div>
        </div>
      </motion.li>
    </Link>
  );
};

export default BlogCard;
