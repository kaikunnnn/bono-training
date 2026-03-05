/**
 * Course List Idea 4: フィルタチップ型
 * Airbnb検索結果に近い。複数カテゴリを選択可能。コースが主役
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import {
  categories,
  courses,
  getCoursesByCategory,
  getTotalCourseCount,
} from '@/components/dev/course-list/courseListData';
import { CourseCard } from '@/components/dev/course-list/CourseCard';

const CourseListIdea4 = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setShowFreeOnly(false);
  };

  // フィルタリング
  let filteredCourses = courses;

  if (selectedCategories.length > 0) {
    filteredCourses = filteredCourses.filter((course) =>
      selectedCategories.includes(course.categoryId)
    );
  }

  if (showFreeOnly) {
    filteredCourses = filteredCourses.filter((course) => !course.isPremium);
  }

  const hasActiveFilters = selectedCategories.length > 0 || showFreeOnly;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dev"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">戻る</span>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">コース一覧</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </nav>

      {/* フィルタバー */}
      <div className="bg-white border-b border-gray-100 sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* フィルタアイコン */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              フィルタ
            </button>

            {/* 無料フィルタ */}
            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                showFreeOnly
                  ? 'bg-emerald-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {showFreeOnly && <Check className="w-4 h-4" />}
              無料コース
            </button>

            <div className="w-px h-6 bg-gray-200 flex-shrink-0"></div>

            {/* カテゴリチップ */}
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    isSelected
                      ? 'text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  style={isSelected ? { backgroundColor: category.color } : {}}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                  {category.name}
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {category.courseCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 結果サマリー */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-medium">
                {filteredCourses.length}件のコース
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  フィルタをクリア
                </button>
              )}
            </div>

            {/* 選択中のフィルタ表示 */}
            {hasActiveFilters && (
              <div className="hidden sm:flex items-center gap-2">
                {showFreeOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                    無料コース
                    <button
                      onClick={() => setShowFreeOnly(false)}
                      className="hover:bg-emerald-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategories.map((catId) => {
                  const cat = categories.find((c) => c.id === catId);
                  if (!cat) return null;
                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name}
                      <button
                        onClick={() => toggleCategory(catId)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コースグリッド */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              該当するコースがありません
            </h3>
            <p className="text-gray-500 mb-4">
              フィルタ条件を変更してください
            </p>
            <button
              onClick={clearFilters}
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              フィルタをクリア
            </button>
          </div>
        )}
      </main>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 4: フィルタチップ型
      </div>
    </div>
  );
};

export default CourseListIdea4;
