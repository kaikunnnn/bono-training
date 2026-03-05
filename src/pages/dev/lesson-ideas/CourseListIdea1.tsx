/**
 * Course List Idea 1: タブナビゲーション型
 * シンプルで標準的。水平タブでカテゴリを切り替え、コースが常に見える
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import {
  categories,
  courses,
  getCoursesByCategory,
  getTotalCourseCount,
} from '@/components/dev/course-list/courseListData';
import { CourseCard } from '@/components/dev/course-list/CourseCard';

const CourseListIdea1 = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const displayedCourses = activeCategory
    ? getCoursesByCategory(activeCategory)
    : courses;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">戻る</span>
          </Link>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">コース一覧</h1>
          <p className="text-gray-500">
            全{getTotalCourseCount()}コースからスキルを身につけよう
          </p>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-100 sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              すべて
              <span className="text-xs opacity-70">
                {getTotalCourseCount()}
              </span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={
                  activeCategory === category.id
                    ? { backgroundColor: category.color }
                    : {}
                }
              >
                {category.name}
                <span className="text-xs opacity-70">
                  {category.courseCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* カテゴリ説明（選択時） */}
      {activeCategory && (
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${
                    categories.find((c) => c.id === activeCategory)?.color
                  }15`,
                }}
              >
                <span
                  className="text-2xl"
                  style={{
                    color: categories.find((c) => c.id === activeCategory)
                      ?.color,
                  }}
                >
                  {categories.find((c) => c.id === activeCategory)?.icon ===
                  'Lightbulb'
                    ? '💡'
                    : categories.find((c) => c.id === activeCategory)?.icon ===
                      'LayoutGrid'
                    ? '📐'
                    : categories.find((c) => c.id === activeCategory)?.icon ===
                      'Search'
                    ? '🔍'
                    : categories.find((c) => c.id === activeCategory)?.icon ===
                      'Palette'
                    ? '🎨'
                    : categories.find((c) => c.id === activeCategory)?.icon ===
                      'Figma'
                    ? '🎯'
                    : categories.find((c) => c.id === activeCategory)?.icon ===
                      'Sparkles'
                    ? '✨'
                    : '💼'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {categories.find((c) => c.id === activeCategory)?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {categories.find((c) => c.id === activeCategory)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* コースグリッド */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {displayedCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">このカテゴリにはまだコースがありません</p>
          </div>
        )}
      </main>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 1: タブナビゲーション型
      </div>
    </div>
  );
};

export default CourseListIdea1;
