import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getArticleWithContext } from "@/lib/sanity";
import type { ArticleWithContext } from "@/types/sanity";
import VideoSection from "@/components/article/VideoSection";
import HeadingSection from "@/components/article/HeadingSection";
import TodoSection from "@/components/article/TodoSection";
import RichTextSection from "@/components/article/RichTextSection";
import ContentNavigation from "@/components/article/ContentNavigation";
import ArticleSideNav from "@/components/article/sidebar/ArticleSideNav";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleWithContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 前後の記事を計算
  const navigation = useMemo(() => {
    if (!article || !article.questInfo?.articles) {
      return { previous: undefined, next: undefined };
    }

    const articles = article.questInfo.articles;
    const currentIndex = articles.findIndex((a) => a._id === article._id);

    if (currentIndex === -1) {
      return { previous: undefined, next: undefined };
    }

    const previousArticle =
      currentIndex > 0
        ? {
            slug: articles[currentIndex - 1].slug.current,
            title: articles[currentIndex - 1].title,
          }
        : undefined;

    const nextArticle =
      currentIndex < articles.length - 1
        ? {
            slug: articles[currentIndex + 1].slug.current,
            title: articles[currentIndex + 1].title,
          }
        : undefined;

    return { previous: previousArticle, next: nextArticle };
  }, [article]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError("記事のスラッグが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getArticleWithContext(slug);

        if (!data) {
          setError("記事が見つかりませんでした");
          setLoading(false);
          return;
        }

        setArticle(data);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("記事の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "記事が見つかりませんでした"}</p>
          <button
            onClick={() => navigate("/lessons")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            レッスン一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 2カラムレイアウト: サイドナビゲーション (320px) + メインコンテンツ (720px) */}
      <div className="flex max-w-[1920px] mx-auto">
        {/* サイドナビゲーション - 固定320px幅 */}
        <aside className="w-[320px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-200 bg-white">
          <ArticleSideNav article={article} currentArticleId={article._id} />
        </aside>

        {/* メインコンテンツエリア */}
        <main className="flex-1 flex flex-col items-center">
          {/* Video Section - 1680px以上の画面で最大1320px、センター揃え */}
          <div className="w-full min-[1680px]:max-w-[1320px] min-[1680px]:px-8 min-[1680px]:pt-8">
            <VideoSection videoUrl={article.videoUrl} />
          </div>

          {/* 記事コンテンツ - 720px幅 */}
          <div className="w-full max-w-[720px] py-8 px-4">
            <div className="space-y-6">
              {/* Heading Section */}
              <HeadingSection
                questNumber={article.questInfo?.questNumber}
                stepNumber={article.articleNumber}
                title={article.title}
                description={article.excerpt}
                onComplete={() => console.log("Complete clicked")}
                onFavorite={() => console.log("Favorite clicked")}
                onShare={() => console.log("Share clicked")}
                onNext={() => console.log("Next clicked")}
              />

              {/* TODO Section - learningObjectives がある場合のみ表示 */}
              <TodoSection items={article.learningObjectives} />

              {/* Rich Text Section - 記事本文 */}
              <RichTextSection content={article.content} />

              {/* Content Navigation - 前後の記事へのナビゲーション */}
              <ContentNavigation previous={navigation.previous} next={navigation.next} />

              {/* デバッグ情報（後で削除） */}
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-200">
                <p className="font-mono text-xs">
                  <strong>Debug Info:</strong>
                </p>
                <p><strong>Quest:</strong> {article.questInfo?.title}</p>
                <p><strong>Lesson:</strong> {article.lessonInfo?.title}</p>
                <p><strong>Learning Objectives:</strong> {article.learningObjectives?.length || 0} items</p>
                <p><strong>Previous Article:</strong> {navigation.previous?.title || "N/A"}</p>
                <p><strong>Next Article:</strong> {navigation.next?.title || "N/A"}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArticleDetail;
