// src/components/blog/BlogPostHeader.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/types/blog";
import { getFluentEmojiUrl, DEFAULT_EMOJI, removeEmojiFromText } from "@/utils/blog/emojiUtils";

interface BlogPostHeaderProps {
  post: BlogPost;
}

export const BlogPostHeader: React.FC<BlogPostHeaderProps> = ({ post }) => {
  return (
    <div className="text-center pt-6 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* 絵文字アイコン（Fluent Emoji 3D） */}
        <div className="flex items-center justify-center">
          <img
            src={getFluentEmojiUrl(post.emoji || DEFAULT_EMOJI)}
            alt=""
            className="w-20 h-20"
            loading="eager"
          />
        </div>

        {/* タイトル（絵文字除去） */}
        <h1 className="text-4xl md:text-5xl font-bold !leading-normal max-w-4xl">
          {removeEmojiFromText(post.title)}
        </h1>

        {/* 説明文（存在する場合のみ表示） */}
        {post.description && (
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed text-balance">
            {post.description}
          </p>
        )}

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
          <span>•</span>
          <span>{post.author}</span>
        </div>

        {/* カテゴリ（Primary Tagのみ） */}
        <div className="flex items-center justify-center">
          <Link to={`/blog/tag/${post.category}`}>
            <Badge className="text-sm px-4 py-2 rounded-full border font-medium transition-colors cursor-pointer bg-transparent text-gray-900 border-black/10 hover:bg-black/5 hover:text-gray-900">
              {post.category}
            </Badge>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogPostHeader;