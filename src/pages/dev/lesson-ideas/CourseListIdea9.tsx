/**
 * Course List Idea 9: プレビュー + カテゴリ詳細ページ型
 * パターン7+8の組み合わせ
 * - ヘッダーにカテゴリチップナビ（パターン5風）
 * - 各カテゴリ3-4コースのプレビュー
 * - 「すべてを見る」でカテゴリ詳細ページに遷移
 */

import React from 'react';
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

const PREVIEW_COUNT = 4; // プレビューで表示するコース数

const CourseListIdea9 = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dev/course-list-patterns"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">パターン一覧</span>
            </Link>
            <span className="text-sm text-gray-400">
              全{getTotalCourseCount()}コース
            </span>
          </div>
        </div>
      </nav>

      {/* ヘッダー + カテゴリチップナビ */}
      <header className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            コース一覧
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl">
            スキル別に整理された{getTotalCourseCount()}のコースから、
            あなたに必要なスキルを見つけましょう。
          </p>

          {/* カテゴリチップナビ（パターン5風） */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/dev/course-list-idea-9/category/${category.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <span
                  className="transition-colors"
                  style={{ color: category.color }}
                >
                  {iconMap[category.icon]}
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {category.name}
                </span>
                <span className="text-xs text-gray-400">
                  {category.courseCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* カテゴリプレビューセクション */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {categories.map((category) => {
          const categoryCourses = getCoursesByCategory(category.id);
          const previewCourses = categoryCourses.slice(0, PREVIEW_COUNT);
          const hasMore = categoryCourses.length > PREVIEW_COUNT;

          if (categoryCourses.length === 0) return null;

          return (
            <section key={category.id} className="mb-14">
              {/* カテゴリヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <span style={{ color: category.color }}>
                      {iconMap[category.icon]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {category.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/dev/course-list-idea-9/category/${category.id}`}
                  className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: category.color }}
                >
                  すべて見る ({categoryCourses.length})
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* コースプレビューグリッド */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {previewCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* もっと見るボタン（モバイル用） */}
              {hasMore && (
                <Link
                  to={`/dev/course-list-idea-9/category/${category.id}`}
                  className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 sm:hidden"
                >
                  残り{categoryCourses.length - PREVIEW_COUNT}コースを見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </section>
          );
        })}
      </main>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 9: プレビュー + カテゴリ詳細ページ型
      </div>
    </div>
  );
};

export default CourseListIdea9;
