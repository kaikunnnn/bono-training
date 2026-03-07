import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLesson, getLessonMetadata, urlFor } from "@/lib/sanity";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// OGP用メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonMetadata(slug);

  if (!lesson) {
    return {
      title: "レッスンが見つかりません",
    };
  }

  const title = `${lesson.title} | BONO`;
  const description = lesson.description || `${lesson.title}のレッスン内容を学習できます。`;
  const imageUrl = lesson.thumbnailUrl || lesson.iconImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

// ページコンポーネント（Server Component）
export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = await getLesson(slug);

  if (!lesson) {
    notFound();
  }

  // 時間をフォーマット（分）
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* ヘッダー部分 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* アイコン画像 */}
            {lesson.iconImageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={lesson.iconImageUrl}
                  alt={lesson.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              {/* タグ */}
              {lesson.tags && lesson.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {lesson.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* タイトル */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </h1>

              {/* 説明 */}
              {lesson.description && (
                <p className="text-gray-600 mb-4">{lesson.description}</p>
              )}

              {/* メタ情報 */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{lesson.totalArticles}本の記事</span>
                {lesson.totalDuration > 0 && (
                  <span>約{formatDuration(lesson.totalDuration)}</span>
                )}
                {lesson.isPremium && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    プレミアム
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ一覧 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {lesson.contentHeading && (
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {lesson.contentHeading}
          </h2>
        )}

        <div className="space-y-6">
          {lesson.quests?.map((quest, questIndex) => (
            <div key={quest._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* クエストヘッダー */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Quest {quest.questNumber || questIndex + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900">{quest.title}</h3>
                </div>
                {quest.goal && (
                  <p className="text-sm text-gray-600 mt-1">{quest.goal}</p>
                )}
              </div>

              {/* 記事リスト */}
              <div className="divide-y">
                {quest.articles?.map((article, articleIndex) => (
                  <Link
                    key={article._id}
                    href={`/articles/${article.slug.current}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* 記事番号 */}
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-100 rounded">
                      {articleIndex + 1}
                    </span>

                    {/* 記事タイトル */}
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-900 line-clamp-1">
                        {article.title}
                      </span>
                    </div>

                    {/* 動画時間 */}
                    {article.videoDuration && (
                      <span className="flex-shrink-0 text-xs text-gray-400">
                        {typeof article.videoDuration === "number"
                          ? `${Math.floor(article.videoDuration / 60)}:${String(article.videoDuration % 60).padStart(2, "0")}`
                          : article.videoDuration}
                      </span>
                    )}

                    {/* プレミアムバッジ */}
                    {article.isPremium && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                        Pro
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 戻るリンク */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
