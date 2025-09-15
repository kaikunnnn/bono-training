// src/components/blog/BlogPostHeader.tsx
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { BlogPost } from "@/types/blog";

interface BlogPostHeaderProps {
  post: BlogPost;
}

const categoryColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-800 border-blue-200',
  design: 'bg-purple-100 text-purple-800 border-purple-200',
  business: 'bg-green-100 text-green-800 border-green-200',
  lifestyle: 'bg-pink-100 text-pink-800 border-pink-200',
};

export const BlogPostHeader: React.FC<BlogPostHeaderProps> = ({ post }) => {
  const categoryColorClass = categoryColors[post.category] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* 絵文字アイコン（正方形） */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
          📝
        </div>

        {/* タイトル */}
        <h1 className="text-4xl md:text-5xl font-bold !leading-normal max-w-4xl">
          {post.title}
        </h1>

        {/* 説明文 */}
        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
          {post.description}
        </p>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime}分で読める</span>
          </div>
        </div>

        {/* カテゴリとタグ */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge className={`text-sm px-4 py-2 rounded-full border font-medium ${categoryColorClass}`}>
            {post.category}
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm px-3 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BlogPostHeader;