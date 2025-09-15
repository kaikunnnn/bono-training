// src/components/blog/PostNavigation.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPost } from "@/types/blog";

interface PostNavigationProps {
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
  className?: string;
}

export const PostNavigation: React.FC<PostNavigationProps> = ({
  prevPost,
  nextPost,
  className = ""
}) => {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* 前の記事 */}
      <div className={!prevPost ? 'md:col-span-1 invisible' : ''}>
        {prevPost && (
          <Link to={`/blog/${prevPost.slug}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center space-x-3">
                <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 mb-1">前の記事</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {prevPost.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* 次の記事 */}
      <div className={!nextPost ? 'md:col-span-1 invisible' : ''}>
        {nextPost && (
          <Link to={`/blog/${nextPost.slug}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-xs text-gray-500 mb-1">次の記事</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {nextPost.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PostNavigation;