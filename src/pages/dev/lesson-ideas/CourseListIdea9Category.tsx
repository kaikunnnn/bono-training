/**
 * Course List Idea 9: カテゴリ詳細ページ
 * 各カテゴリのコース全件を表示する別ページ
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
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
  getCoursesByCategory,
  getCategoryById,
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

const iconMapSmall: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Figma: <Figma className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
};

const CourseListIdea9Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId || '');
  const categoryCourses = getCoursesByCategory(categoryId || '');

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            カテゴリが見つかりません
          </h1>
          <Link
            to="/dev/course-list-idea-9"
            className="text-indigo-600 hover:text-indigo-700"
          >
            コース一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dev/course-list-idea-9"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">コース一覧</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* カテゴリヘッダー */}
      <header
        className="border-b border-gray-100"
        style={{ backgroundColor: `${category.color}08` }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: category.color }}
            >
              <span className="text-white">{iconMap[category.icon]}</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-500">{categoryCourses.length}コース</p>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl">
            {category.description}
          </p>
        </div>

        {/* 他のカテゴリへのナビ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isActive = cat.id === categoryId;
              return (
                <Link
                  key={cat.id}
                  to={`/dev/course-list-idea-9/category/${cat.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-white'
                      : 'bg-white/80 text-gray-600 hover:bg-white'
                  }`}
                  style={isActive ? { backgroundColor: cat.color } : {}}
                >
                  <span className={isActive ? 'text-white' : ''} style={!isActive ? { color: cat.color } : {}}>
                    {iconMapSmall[cat.icon]}
                  </span>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* コース一覧 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {categoryCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">
              このカテゴリにはまだコースがありません
            </p>
          </div>
        )}
      </main>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 9: カテゴリ詳細ページ
      </div>
    </div>
  );
};

export default CourseListIdea9Category;
