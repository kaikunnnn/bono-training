/**
 * Course List Idea 6: スティッキーヘッダー型
 * スクロール時にカテゴリヘッダーが追従。今どのカテゴリを見ているか常にわかる
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronUp,
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

const CourseListIdea6 = () => {
  const [currentSection, setCurrentSection] = useState<string>(categories[0].id);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      // 現在表示中のセクションを検出
      const scrollPosition = window.scrollY + 150;

      for (const category of categories) {
        const section = sectionRefs.current[category.id];
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setCurrentSection(category.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (categoryId: string) => {
    sectionRefs.current[categoryId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCategory = categories.find((c) => c.id === currentSection);

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* スティッキーカテゴリヘッダー */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-[57px] z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* 現在のカテゴリ表示 */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: currentCategory?.color }}
              >
                <span className="text-white">
                  {iconMap[currentCategory?.icon || '']}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {currentCategory?.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {currentCategory?.courseCount}コース
                </p>
              </div>
            </div>

            {/* ミニナビ（ドット） */}
            <div className="hidden sm:flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToSection(category.id)}
                  className={`group relative w-3 h-3 rounded-full transition-all ${
                    currentSection === category.id
                      ? 'scale-125'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor:
                      currentSection === category.id
                        ? category.color
                        : '#E5E7EB',
                  }}
                >
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリセクション */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {categories.map((category) => {
          const categoryCourses = getCoursesByCategory(category.id);

          return (
            <section
              key={category.id}
              ref={(el) => (sectionRefs.current[category.id] = el)}
              className="mb-16 scroll-mt-32"
            >
              {/* セクションヘッダー */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
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
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>

              {/* コースグリッド */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {categoryCourses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-400">
                    このカテゴリにはまだコースがありません
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* スクロールトップボタン */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* サイドナビ（デスクトップ） */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => scrollToSection(category.id)}
            className={`group flex items-center gap-3 transition-all ${
              currentSection === category.id ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                currentSection === category.id ? 'scale-150' : ''
              }`}
              style={{ backgroundColor: category.color }}
            ></div>
            <span
              className={`text-sm font-medium transition-all ${
                currentSection === category.id
                  ? 'text-gray-900'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>

      {/* パターン情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-500 shadow-lg border border-gray-200">
        Pattern 6: スティッキーヘッダー型
      </div>
    </div>
  );
};

export default CourseListIdea6;
