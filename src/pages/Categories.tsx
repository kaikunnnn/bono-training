import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useLessons } from "@/hooks/useLessons";
import { useMemo } from "react";

export default function Categories() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: lessons } = useLessons();

  // カテゴリごとのレッスン数をカウント
  const categoryCounts = useMemo(() => {
    if (!lessons || !categories) return {};

    const counts: Record<string, number> = {};
    categories.forEach((category) => {
      counts[category._id] = 0;
    });

    lessons.forEach((lesson) => {
      if (lesson.category) {
        // categoryは参照型なので、_idまたは文字列の可能性がある
        const categoryId = typeof lesson.category === 'string'
          ? lesson.category
          : (lesson.category as any)?._ref || (lesson.category as any)?._id;

        if (categoryId && counts[categoryId] !== undefined) {
          counts[categoryId]++;
        }
      }
    });

    return counts;
  }, [lessons, categories]);

  if (categoriesLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">カテゴリ一覧</h1>
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </Layout>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">カテゴリ一覧</h1>
          <div className="text-gray-500">カテゴリが見つかりませんでした</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">カテゴリ一覧</h1>
          <p className="text-gray-600">
            興味のあるカテゴリを選んでレッスンを探しましょう
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              lessonCount={categoryCounts[category._id] || 0}
            />
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/lessons"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← すべてのレッスンを見る
          </Link>
        </div>
      </div>
    </Layout>
  );
}

interface CategoryCardProps {
  category: Category;
  lessonCount: number;
}

function CategoryCard({ category, lessonCount }: CategoryCardProps) {
  const borderColor = category.color || "#9CA3AF";

  return (
    <Link
      to={`/categories/${category.slug.current}`}
      className="block group"
    >
      <div
        className="h-full border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
        style={{ borderColor }}
      >
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-2xl font-bold group-hover:text-gray-700">
            {category.title}
          </h2>
          {category.color && (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: category.color }}
              aria-label={`カラー: ${category.color}`}
            />
          )}
        </div>

        {category.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {lessonCount > 0 ? `${lessonCount}件のレッスン` : "レッスンなし"}
          </span>
          <span className="text-blue-600 group-hover:text-blue-700 font-medium">
            詳しく見る →
          </span>
        </div>
      </div>
    </Link>
  );
}
