/**
 * Course List Idea 3: Magazineスクロール型
 * 各カテゴリがセクションとして縦に並ぶ。全コースを俯瞰できる
 */

import React, { useRef } from 'react';
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
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  Figma: <Figma className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
};

const CourseListIdea3 = () => {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToSection = (categoryId: string) => {
    sectionRefs.current[categoryId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">戻る</span>
          </Link>
        </div>
      </nav>

      {/* ヒーローヘッダー */}
      <header className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            コース一覧
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl">
            デザインスキルを体系的に学べる全{getTotalCourseCount()}コース。
            あなたの目的に合わせて選んでください。
          </p>

          {/* カテゴリクイックナビ */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <span style={{ color: category.color }}>
                  {iconMap[category.icon]}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* カテゴリセクション */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {categories.map((category, index) => {
          const categoryCourses = getCoursesByCategory(category.id);

          return (
            <section
              key={category.id}
              ref={(el) => (sectionRefs.current[category.id] = el)}
              className={`py-12 sm:py-16 ${
                index !== categories.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* セクションヘッダー */}
              <div className="flex items-start gap-4 mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <span style={{ color: category.color }}>
                    {iconMap[category.icon]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {category.courseCount}コース
                    </span>
                  </div>
                  <p className="text-gray-500">{category.description}</p>
                </div>
              </div>

              {/* コースグリッド */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {categoryCourses.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400">
                    このカテゴリにはまだコースがありません
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* スキルマップ概要（ボトムCTA） */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              スキルの全体像を把握しよう
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              各カテゴリは独立しているのではなく、相互に関連しています。
              基礎から応用へ、体系的に学ぶことで効率よくスキルアップできます。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${category.color}30` }}
                >
                  <span style={{ color: category.color }}>
                    {iconMap[category.icon]}
                  </span>
                </div>
                <span className="text-sm text-center">{category.name}</span>
                <span className="text-xs text-gray-500 mt-1">
                  {category.courseCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 3: Magazineスクロール型
      </div>
    </div>
  );
};

export default CourseListIdea3;
