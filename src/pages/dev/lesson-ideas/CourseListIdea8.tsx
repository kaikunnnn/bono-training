/**
 * Course List Idea 8: カテゴリプレビュー型
 * 各カテゴリから数コースずつプレビュー→「すべて見る」で展開。全体像を最初に把握
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  LayoutGrid,
  Search,
  Palette,
  Figma,
  Sparkles,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import {
  categories,
  getCoursesByCategory,
  getTotalCourseCount,
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

const PREVIEW_COUNT = 3; // プレビューで表示するコース数

const CourseListIdea8 = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categories.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
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

      {/* ヘッダー */}
      <header className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              デザインスキルを探す
            </h1>
            <p className="text-gray-500 text-lg mb-6">
              7つのカテゴリから、あなたに必要なスキルを見つけましょう。
            </p>
          </div>

          {/* 展開/折りたたみボタン */}
          <div className="flex gap-3">
            <button
              onClick={expandAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              すべて展開
            </button>
            <button
              onClick={collapseAll}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:border-gray-300 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              すべて折りたたむ
            </button>
          </div>
        </div>
      </header>

      {/* カテゴリセクション */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {categories.map((category) => {
          const categoryCourses = getCoursesByCategory(category.id);
          const isExpanded = expandedCategories.has(category.id);
          const displayedCourses = isExpanded
            ? categoryCourses
            : categoryCourses.slice(0, PREVIEW_COUNT);
          const hasMore = categoryCourses.length > PREVIEW_COUNT;

          if (categoryCourses.length === 0) return null;

          return (
            <section key={category.id} className="mb-12">
              {/* カテゴリヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <span style={{ color: category.color }}>
                      {iconMap[category.icon]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {category.name}
                      </h2>
                      <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {category.courseCount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {category.description}
                    </p>
                  </div>
                </div>

                {hasMore && (
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: category.color }}
                  >
                    {isExpanded ? (
                      <>
                        折りたたむ
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        すべて見る (+{categoryCourses.length - PREVIEW_COUNT})
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* コースグリッド */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* 展開ボタン（モバイル/追加） */}
              {hasMore && !isExpanded && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  残り{categoryCourses.length - PREVIEW_COUNT}コースを見る
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </section>
          );
        })}
      </main>

      {/* スキル全体像サマリー */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            スキルカテゴリの全体像
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => {
              const courseCount = getCoursesByCategory(category.id).length;
              return (
                <div
                  key={category.id}
                  className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => {
                    const element = document.getElementById(category.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${category.color}30` }}
                  >
                    <span style={{ color: category.color }}>
                      {iconMap[category.icon]}
                    </span>
                  </div>
                  <span className="text-sm text-center font-medium">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {courseCount}コース
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 8: カテゴリプレビュー型
      </div>
    </div>
  );
};

export default CourseListIdea8;
