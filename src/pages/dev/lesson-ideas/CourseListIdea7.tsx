/**
 * Course List Idea 7: カテゴリ別キャロセル型
 * Netflix風。各カテゴリが水平キャロセルで、全体像と深掘りを両立
 */

import React, { useRef } from 'react';
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

interface CarouselSectionProps {
  category: typeof categories[0];
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ category }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryCourses = getCoursesByCategory(category.id);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (categoryCourses.length === 0) return null;

  return (
    <section className="mb-10">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
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
            <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
        </div>
        <button className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          すべて見る
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* キャロセル */}
      <div className="relative group">
        {/* 左スクロールボタン */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* コースキャロセル */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 lg:px-8 pb-2"
        >
          {categoryCourses.map((course) => (
            <div key={course.id} className="flex-shrink-0 w-72">
              <CourseCard course={course} variant="compact" />
            </div>
          ))}

          {/* すべて見るカード */}
          <div className="flex-shrink-0 w-72">
            <div
              className="aspect-[16/10] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-80"
              style={{ backgroundColor: `${category.color}10` }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <ArrowRight className="w-6 h-6" style={{ color: category.color }} />
              </div>
              <span className="text-sm font-medium" style={{ color: category.color }}>
                {category.name}をすべて見る
              </span>
            </div>
          </div>
        </div>

        {/* 右スクロールボタン */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </section>
  );
};

const CourseListIdea7 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* ヒーローセクション */}
      <header className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              デザインスキルを
              <br />
              体系的に学ぼう
            </h1>
            <p className="text-white/80 text-lg mb-6">
              7つのカテゴリ、{getTotalCourseCount()}のコースから
              あなたに必要なスキルを選んで学習できます。
            </p>

            {/* カテゴリクイックナビ */}
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 4).map((category) => (
                <span
                  key={category.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-sm"
                >
                  {iconMap[category.icon]}
                  {category.name}
                </span>
              ))}
              <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm">
                +{categories.length - 4}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* カテゴリ別キャロセル */}
      <main className="py-8">
        {categories.map((category) => (
          <CarouselSection key={category.id} category={category} />
        ))}
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-4">
            スキルの全体像を把握しよう
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            各カテゴリは相互に関連しています。基礎から応用へ、
            体系的に学ぶことで効率よくスキルアップできます。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${category.color}30` }}
              >
                <span style={{ color: category.color }}>
                  {iconMap[category.icon]}
                </span>
                <span className="text-sm">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 7: カテゴリ別キャロセル型
      </div>
    </div>
  );
};

export default CourseListIdea7;
