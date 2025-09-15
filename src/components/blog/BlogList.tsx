// src/components/blog/BlogList.tsx
import { motion } from "framer-motion";
import { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
  variant?: 'grid' | 'list';
}

const listContainerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const BlogList: React.FC<BlogListProps> = ({ posts, variant = 'grid' }) => {
  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {posts.map((post, index) => (
        <BlogCard key={post.id} post={post} index={index} />
      ))}
    </motion.div>
  );
};

export default BlogList;