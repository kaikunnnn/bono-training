import React from "react";
import { Link } from "react-router-dom";
import type { Guide } from "@/types/guide";
import CategoryBadge from "./CategoryBadge";
import { Clock, Calendar, User, ChevronRight } from "lucide-react";

interface GuideHeaderProps {
  guide: Guide;
}

/**
 * ガイド詳細ページのヘッダーコンポーネント
 */
const GuideHeader = ({ guide }: GuideHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/guide" className="hover:text-gray-700 transition-colors">
            ガイド
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{guide.title}</span>
        </nav>

        {/* カテゴリ */}
        <div className="mb-4">
          <CategoryBadge category={guide.category} />
        </div>

        {/* タイトル */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {guide.title}
        </h1>

        {/* 説明 */}
        <p className="text-lg text-gray-600 mb-6">
          {guide.description}
        </p>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>{guide.author}</span>
          </div>
          {guide.publishedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(guide.publishedAt).toLocaleDateString('ja-JP')}</span>
            </div>
          )}
          {guide.updatedAt && (
            <div className="flex items-center gap-1.5">
              <span>更新: {new Date(guide.updatedAt).toLocaleDateString('ja-JP')}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{guide.readingTime}</span>
          </div>
        </div>

        {/* タグ */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideHeader;
