import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Guide } from "@/types/guide";
import CategoryBadge from "./CategoryBadge";
import { Clock } from "lucide-react";

interface GuideCardProps {
  guide: Guide;
  className?: string;
}

/**
 * ガイドカードコンポーネント
 */
const GuideCard = ({ guide, className }: GuideCardProps) => {
  return (
    <Link
      to={`/guide/${guide.slug}`}
      className={cn(
        "group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100",
        className
      )}
    >
      {/* サムネイル */}
      {guide.thumbnail && (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={guide.thumbnail}
            alt={guide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-5">
        {/* カテゴリバッジ */}
        <div className="mb-3">
          <CategoryBadge category={guide.category} />
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {guide.title}
        </h3>

        {/* 説明 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {guide.description}
        </p>

        {/* メタ情報 */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{guide.readingTime}</span>
          </div>
          {guide.publishedAt && (
            <div>
              <span>{new Date(guide.publishedAt).toLocaleDateString('ja-JP')}</span>
            </div>
          )}
        </div>

        {/* タグ（オプション） */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default GuideCard;
