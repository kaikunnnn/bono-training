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
        <div className="p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold mb-4">レッスン一覧</h1>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold mb-4">レッスン一覧</h1>
          <p className="text-red-600">エラー: {error instanceof Error ? error.message : 'データの取得に失敗しました'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">レッスン一覧</h1>

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {lessons.map((lesson) => {
              // WebflowのカテゴリIDは表示しない（Sanityで手動入力したカテゴリは表示）
              const shouldShowCategory = lesson.category &&
                lesson.category.length < 20; // IDっぽい長い文字列は除外

              // アイコン画像URL（Webflow優先、なければSanity）- 元の比率を維持
              const iconUrl = lesson.iconImageUrl ||
                             (lesson.iconImage ? urlFor(lesson.iconImage).height(300).url() : null);

              return (
                <div
                  key={lesson._id}
                  onClick={() => handleLessonClick(lesson.slug.current)}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  {/* 画像エリア - グレー背景 + アイコン中央配置 */}
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    {iconUrl ? (
                      <div className="rounded-r-lg shadow-[1px_1px_12px_0_rgba(0,0,0,0.24)] overflow-hidden">
                        <img
                          src={iconUrl}
                          alt={lesson.title}
                          className="h-32 w-auto object-cover block"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded-r-lg" />
                    )}
                  </div>
                  <div className="p-4">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
