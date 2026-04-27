// src/components/blog/PostNavigation.tsx
import { BlogPost } from "@/types/blog";

interface PostNavigationProps {
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
  className?: string;
}

/**
 * 前後の記事ナビゲーションコンポーネント
 *
 * TODO: 前後の記事ナビゲーションが必要になったら有効にする
 */
export const PostNavigation: React.FC<PostNavigationProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prevPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nextPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className = ""
}) => {
  // 現在は無効化されています
  return null;
};

export default PostNavigation;
