import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import { useCategories } from "@/hooks/useCategories";

/**
 * カテゴリIDを抽出するヘルパー関数
 */
function extractCategoryId(category: any, categories?: any[]): string | null {
  if (!category) return null;

  // 参照型の場合
  if (typeof category === 'object') {
    return category._ref || category._id || null;
  }

  // 文字列の場合、カテゴリタイトルからIDに変換
  if (typeof category === 'string' && categories) {
    const matchedCategory = categories.find(cat => cat.title === category);
    return matchedCategory?._id || null;
  }

  // それ以外の文字列（既にIDの可能性）
  return category;
}

export default function Lessons() {
  const navigate = useNavigate();
  const { data: lessons, isLoading: loading, error } = useLessons();
  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!selectedCategoryId) return lessons;

    return lessons.filter((lesson) => {
      const categoryId = extractCategoryId(lesson.category, categories);
      return categoryId === selectedCategoryId;
    });
  }, [lessons, selectedCategoryId, categories]);

  const categoryCounts = useMemo(() => {
    if (!lessons || !categories) return {};

    const counts: Record<string, number> = {};
    categories.forEach((category) => {
      counts[category._id] = 0;
    });

    lessons.forEach((lesson) => {
      const categoryId = extractCategoryId(lesson.category, categories);
      if (categoryId && counts[categoryId] !== undefined) {
        counts[categoryId]++;
      }
    });

    return counts;
  }, [lessons, categories]);

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">レッスン一覧</h1>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">レッスン一覧</h1>
          <p className="text-red-600">エラー: {error instanceof Error ? error.message : 'データの取得に失敗しました'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">レッスン一覧</h1>

        {/* カテゴリフィルタータブ */}
        {categories && categories.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  !selectedCategoryId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                すべて ({lessons?.length || 0})
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategoryId(category._id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    selectedCategoryId === category._id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  style={
                    selectedCategoryId === category._id && category.color
                      ? { backgroundColor: category.color }
                      : {}
                  }
                >
                  {category.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  {category.title} ({categoryCounts[category._id] || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredLessons.length === 0 ? (
          <p>
            {selectedCategoryId
              ? "このカテゴリにはレッスンがありません。"
              : "レッスンがありません。Sanity Studioでデータを追加してください。"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => {
              const imageUrl = lesson.coverImageUrl ||
                              (lesson.coverImage ? urlFor(lesson.coverImage).width(400).height(300).url() : null);

              const shouldShowCategory = lesson.category &&
                lesson.category.length < 20;

              return (
                <div
                  key={lesson._id}
                  onClick={() => handleLessonClick(lesson.slug.current)}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={lesson.title}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  {shouldShowCategory && (
                    <p className="text-sm text-gray-600 mb-2">{lesson.category}</p>
                  )}
                  <h2 className="text-xl font-bold mb-2">
                    {lesson.title}
                    {lesson.isPremium && <span className="ml-2">🔒</span>}
                  </h2>
                  {lesson.description && (
                    <p className="text-gray-700">{lesson.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
