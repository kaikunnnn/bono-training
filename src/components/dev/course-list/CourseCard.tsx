/**
 * コースカード - 共通コンポーネント
 * 全パターンで使用する主役オブジェクト
 */

import React from 'react';
import { Clock, BookOpen, Crown } from 'lucide-react';
import { Course, getCategoryById } from './courseListData';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'horizontal';
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'default',
}) => {
  const category = getCategoryById(course.categoryId);

  if (variant === 'horizontal') {
    return (
      <div className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer">
        {/* サムネイル */}
        <div
          className={`w-32 h-24 rounded-lg bg-gradient-to-br ${course.thumbnail} flex-shrink-0`}
        />
        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${category?.color}15`,
                color: category?.color,
              }}
            >
              {category?.name}
            </span>
            {course.isPremium && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1 mb-2">
            {course.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.lessonCount}本
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.totalDuration}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer overflow-hidden">
        {/* サムネイル */}
        <div
          className={`aspect-[16/10] bg-gradient-to-br ${course.thumbnail} relative`}
        >
          {course.isPremium && (
            <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>
        {/* 情報 */}
        <div className="p-3">
          <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.lessonCount}本
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.totalDuration}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
      {/* サムネイル */}
      <div
        className={`aspect-video bg-gradient-to-br ${course.thumbnail} relative`}
      >
        {course.isPremium && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        )}
        {!course.isPremium && (
          <span className="absolute top-3 right-3 text-xs text-white bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
            無料
          </span>
        )}
      </div>
      {/* 情報 */}
      <div className="p-4">
        {/* カテゴリタグ */}
        <span
          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2"
          style={{
            backgroundColor: `${category?.color}15`,
            color: category?.color,
          }}
        >
          {category?.name}
        </span>
        {/* タイトル */}
        <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        {/* 一行説明 */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {course.description}
        </p>
        {/* メタ情報 */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {course.lessonCount}本
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {course.totalDuration}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
