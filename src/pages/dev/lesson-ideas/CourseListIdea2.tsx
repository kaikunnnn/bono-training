/**
 * Course List Idea 2: サイドバー型
 * 左にカテゴリナビ+説明、右にコースグリッド。デスクトップで効率的
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
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
  Category,
} from '@/components/dev/course-list/courseListData';
import { CourseCard } from '@/components/dev/course-list/CourseCard';

const iconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Figma: <Figma className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

const CourseListIdea2 = () => {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);

  const currentCategory = categories.find((c) => c.id === activeCategory)!;
  const displayedCourses = getCoursesByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">戻る</span>
          </Link>
          <div className="text-sm text-gray-400">
            全{getTotalCourseCount()}コース
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        {/* サイドバー */}
        <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-100 min-h-[calc(100vh-57px)] sticky top-[57px] self-start hidden lg:block">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">コース一覧</h1>
            <p className="text-sm text-gray-500 mb-6">
              スキル別にコースを探す
            </p>

            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeCategory === category.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 ${
                      activeCategory === category.id
                        ? 'text-white'
                        : ''
                    }`}
                    style={
                      activeCategory !== category.id
                        ? { color: category.color }
                        : {}
                    }
                  >
                    {iconMap[category.icon]}
                  </span>
                  <span className="flex-1 font-medium">{category.name}</span>
                  <span
                    className={`text-xs ${
                      activeCategory === category.id
                        ? 'text-white/60'
                        : 'text-gray-400'
                    }`}
                  >
                    {category.courseCount}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* カテゴリ説明カード */}
          <div className="px-6 pb-6">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${currentCategory.color}10` }}
            >
              <h3
                className="font-bold mb-1"
                style={{ color: currentCategory.color }}
              >
                {currentCategory.name}とは？
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentCategory.description}
              </p>
            </div>
          </div>
        </aside>

        {/* モバイル用カテゴリセレクター */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex overflow-x-auto py-2 px-4 gap-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                style={
                  activeCategory === category.id
                    ? { backgroundColor: category.color }
                    : {}
                }
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          {/* カテゴリヘッダー */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${currentCategory.color}15` }}
              >
                <span style={{ color: currentCategory.color }}>
                  {iconMap[currentCategory.icon]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentCategory.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {displayedCourses.length}コース
                </p>
              </div>
            </div>
            <p className="text-gray-600 lg:hidden">
              {currentCategory.description}
            </p>
          </div>

          {/* コースグリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200 hidden lg:block">
        Pattern 2: サイドバー型
      </div>
    </div>
  );
};

export default CourseListIdea2;
