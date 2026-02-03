import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Lessons() {
  const navigate = useNavigate();
  const { data: lessons, isLoading: loading, error } = useLessons();

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold mb-4">レッスン一覧</h1>
          <p className="text-red-600">
            エラー:{" "}
            {error instanceof Error
              ? error.message
              : "データの取得に失敗しました"}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          レッスン一覧
        </h1>
        <p className="text-sm md:text-base !text-black mb-6">
          工事中です👷
          <br />
          デザインサイクルと一部、AI×リサーチ＆プロトタイプだけ見れます。
        </p>

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {lessons.map((lesson) => {
              // WebflowのカテゴリIDは表示しない（Sanityで手動入力したカテゴリは表示）
              const shouldShowCategory =
                lesson.category && lesson.category.length < 20; // IDっぽい長い文字列は除外

              // レッスン画像URL（サムネ優先）
              // 優先順位: thumbnailUrl (Webflow) > thumbnail (Sanity image) > iconImageUrl > iconImage
              const thumbnailUrl =
                lesson.thumbnailUrl ||
                (lesson.thumbnail
                  ? urlFor(lesson.thumbnail).width(1200).height(630).url()
                  : null) ||
                lesson.iconImageUrl ||
                (lesson.iconImage
                  ? urlFor(lesson.iconImage).width(400).height(400).url()
                  : null);

              return (
                <div
                  key={lesson._id}
                  onClick={() => handleLessonClick(lesson.slug.current)}
                  className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  {/* 画像エリア - サムネイル（cover）優先 */}
                  <div className="w-full h-48 bg-gray-100">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="p-4">
                    {shouldShowCategory && (
                      <p className="text-sm text-gray-600 mb-2">
                        {lesson.category}
                      </p>
                    )}
                    <h2 className="text-xl font-bold mb-2">
                      {lesson.title}
                      {lesson.isPremium && <span className="ml-2">🔒</span>}
                    </h2>
                    {lesson.description && (
                      <p className="text-gray-700 line-clamp-3">
                        {lesson.description}
                      </p>
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
