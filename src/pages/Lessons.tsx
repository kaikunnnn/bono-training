import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";

export default function Lessons() {
  const navigate = useNavigate();
  const { data: lessons, isLoading: loading, error } = useLessons();

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

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

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => {
              // Webflowの画像URL（文字列）またはSanityの画像オブジェクト
              const imageUrl = lesson.coverImageUrl ||
                              (lesson.coverImage ? urlFor(lesson.coverImage).width(400).height(300).url() : null);

              // WebflowのカテゴリIDは表示しない（Sanityで手動入力したカテゴリは表示）
              const shouldShowCategory = lesson.category &&
                lesson.category.length < 20; // IDっぽい長い文字列は除外

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
