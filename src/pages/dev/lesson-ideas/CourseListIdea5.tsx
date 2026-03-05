/**
 * Course List Idea 5: アイコンカテゴリバー型
 * Airbnbホーム風。アイコン+ラベルで視覚的にカテゴリを識別
 */

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  LayoutGrid,
  Search,
  Palette,
  Figma,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import {
  categories,
  courses,
  getCoursesByCategory,
  getTotalCourseCount,
} from '@/components/dev/course-list/courseListData';
import { CourseCard } from '@/components/dev/course-list/CourseCard';

const iconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  Figma: <Figma className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
};

const CourseListIdea5 = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayedCourses = activeCategory
    ? getCoursesByCategory(activeCategory)
    : courses;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="border-b border-gray-100 sticky top-0 z-50 bg-white">
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
            <div className="text-sm text-gray-400">
              {getTotalCourseCount()}コース
            </div>
          </div>
        </div>
      </nav>

      {/* アイコンカテゴリバー（Airbnb風） */}
      <div className="border-b border-gray-100 sticky top-[57px] z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* 左スクロールボタン */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-shadow hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* カテゴリスクロール */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 py-4 overflow-x-auto scrollbar-hide scroll-smooth px-0 sm:px-8"
          >
            {/* すべて */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex flex-col items-center gap-2 min-w-[56px] transition-all ${
                activeCategory === null
                  ? 'opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  activeCategory === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <LayoutGrid className="w-6 h-6" />
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  activeCategory === null ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                すべて
              </span>
              {activeCategory === null && (
                <div className="w-full h-0.5 bg-gray-900 rounded-full -mt-1"></div>
              )}
            </button>

            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex flex-col items-center gap-2 min-w-[56px] transition-all ${
                    isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all`}
                    style={{
                      backgroundColor: isActive
                        ? category.color
                        : `${category.color}15`,
                      color: isActive ? 'white' : category.color,
                    }}
                  >
                    {iconMap[category.icon]}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {category.name}
                  </span>
                  {isActive && (
                    <div
                      className="w-full h-0.5 rounded-full -mt-1"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 右スクロールボタン */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-shadow hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* カテゴリ説明（選択時） */}
      {activeCategory && (
        <div className="bg-gradient-to-r from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    categories.find((c) => c.id === activeCategory)?.color,
                }}
              >
                <span className="text-white">
                  {
                    iconMap[
                      categories.find((c) => c.id === activeCategory)?.icon ||
                        ''
                    ]
                  }
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {categories.find((c) => c.id === activeCategory)?.name}
                </h2>
                <p className="text-gray-500">
                  {categories.find((c) => c.id === activeCategory)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* コースグリッド */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {activeCategory
              ? `${
                  categories.find((c) => c.id === activeCategory)?.name
                }のコース`
              : 'すべてのコース'}
          </h2>
          <span className="text-sm text-gray-400">
            {displayedCourses.length}件
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {displayedCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">
              このカテゴリにはまだコースがありません
            </p>
          </div>
        )}
      </main>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 5: アイコンカテゴリバー型
      </div>
    </div>
  );
};

export default CourseListIdea5;
