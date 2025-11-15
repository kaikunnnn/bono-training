import { useParams, useNavigate, Link } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessonsByCategory } from "@/hooks/useLessonsByCategory";

export default function CategoryLessons() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { lessons, category, isLoading, error } = useLessonsByCategory(categorySlug || "");

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">カテゴリ読み込み中...</h1>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">カテゴリが見つかりません</h1>
          <p className="text-gray-600 mb-6">
            指定されたカテゴリ "{categorySlug}" は存在しません。
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← カテゴリ一覧に戻る
          </Link>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">{category.title}</h1>
          <p className="text-red-600">
            エラー: {error instanceof Error ? error.message : "データの取得に失敗しました"}
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4"
          >
            ← カテゴリ一覧に戻る
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← カテゴリ一覧に戻る
          </Link>

          <div className="flex items-center gap-3 mb-3">
            {category.color && (
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
                aria-label={`カラー: ${category.color}`}
              />
            )}
            <h1 className="text-3xl font-bold">{category.title}</h1>
          </div>

          {category.description && (
            <p className="text-gray-600 text-lg">{category.description}</p>
          )}

          <p className="text-gray-500 mt-2">
            {lessons.length > 0
              ? `${lessons.length}件のレッスンがあります`
              : "このカテゴリにはまだレッスンがありません"}
          </p>
        </div>

        {/* レッスン一覧 */}
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              このカテゴリにはまだレッスンがありません。
            </p>
            <Link
              to="/lessons"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              すべてのレッスンを見る →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => {
              // Webflowの画像URL（文字列）またはSanityの画像オブジェクト
              const imageUrl =
                lesson.coverImageUrl ||
                (lesson.coverImage
                  ? urlFor(lesson.coverImage).width(400).height(300).url()
                  : null);

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
                  <h2 className="text-xl font-bold mb-2">
                    {lesson.title}
                    {lesson.isPremium && <span className="ml-2">🔒</span>}
                  </h2>
                  {lesson.description && (
                    <p className="text-gray-700 line-clamp-3">{lesson.description}</p>
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
