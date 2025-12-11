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
import { toggleBookmark, isBookmarked } from "@/services/bookmarks";
import { toggleArticleCompletion, getArticleProgress } from "@/services/progress";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleWithContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0);

  // 前後の記事を計算（クエストをまたぐナビゲーション対応）
  const navigation = useMemo(() => {
    if (!article || !article.lessonInfo?.quests) {
      return { previous: undefined, next: undefined };
    }

    // レッスン内の全記事をフラット化
    const allArticles: { slug: string; title: string; questId: string }[] = [];
    for (const quest of article.lessonInfo.quests) {
      for (const art of quest.articles) {
        allArticles.push({
          slug: art.slug.current,
          title: art.title,
          questId: quest._id,
        });
      }
    }

    const currentIndex = allArticles.findIndex(
      (a) => a.slug === article.slug.current
    );

    if (currentIndex === -1) {
      return { previous: undefined, next: undefined };
    }

    const previousArticle =
      currentIndex > 0
        ? {
            slug: allArticles[currentIndex - 1].slug,
            title: allArticles[currentIndex - 1].title,
          }
        : undefined;

    const nextArticle =
      currentIndex < allArticles.length - 1
        ? {
            slug: allArticles[currentIndex + 1].slug,
            title: allArticles[currentIndex + 1].title,
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

  // ブックマーク状態の初期化
  useEffect(() => {
    const checkBookmark = async () => {
      if (article?._id) {
        const result = await isBookmarked(article._id);
        setBookmarked(result);
      }
    };
    checkBookmark();
  }, [article?._id]);

  // 記事の進捗状態を取得
  useEffect(() => {
    const checkProgress = async () => {
      if (article?._id) {
        const status = await getArticleProgress(article._id);
        setIsCompleted(status === 'completed');
      }
    };
    checkProgress();
  }, [article?._id]);

  // ブックマークトグル処理
  const handleBookmarkToggle = async () => {
    if (!article) return;

    setBookmarkLoading(true);
    const result = await toggleBookmark(article._id, false);

    if (result.success) {
      setBookmarked(result.isBookmarked);
    }
    setBookmarkLoading(false);
  };

  // 完了ボタンのハンドラー
  const handleCompleteToggle = async () => {
    if (!article || !article.lessonInfo?._id) return;

    setCompletionLoading(true);
    const result = await toggleArticleCompletion(
      article._id,
      article.lessonInfo._id
    );

    if (result.success) {
      setIsCompleted(result.isCompleted);
      // サイドナビの進捗を更新するトリガー
      setProgressUpdateTrigger(prev => prev + 1);
    }
    setCompletionLoading(false);
  };

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
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* 2カラムレイアウト: サイドナビゲーション (320px) + メインコンテンツ (720px) */}
      <div className="flex max-w-[1920px] mx-auto">
        {/* サイドナビゲーション - 固定320px幅 */}
        <aside className="w-[320px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-200">
          <ArticleSideNav article={article} currentArticleId={article._id} progressUpdateTrigger={progressUpdateTrigger} />
        </aside>

        {/* メインコンテンツエリア */}
        <main className="flex-1 flex flex-col items-center">
          {/* Heading Section - 独立ブロック、720px幅 */}
          <div className="w-full max-w-[720px] pt-8 pb-4 px-4">
            <HeadingSection
              questNumber={article.questInfo?.questNumber}
              stepNumber={article.articleNumber}
              title={article.title}
              description={article.excerpt}
              onComplete={handleCompleteToggle}
              onFavorite={handleBookmarkToggle}
              onShare={() => console.log("Share clicked")}
              onNext={navigation.next ? () => navigate(`/articles/${navigation.next.slug}`) : undefined}
              isBookmarked={bookmarked}
              bookmarkLoading={bookmarkLoading}
              isCompleted={isCompleted}
              completionLoading={completionLoading}
            />
          </div>

          {/* Video Section - 1680px以上の画面で最大1320px、センター揃え */}
          <div className="w-full min-[1680px]:max-w-[1320px] min-[1680px]:px-8 min-[1680px]:pt-8">
            <VideoSection
              videoUrl={article.videoUrl}
              thumbnail={article.thumbnail}
              thumbnailUrl={article.thumbnailUrl}
              isPremium={article.isPremium}
            />
          </div>

          {/* 記事コンテンツ - 720px幅 */}
          <div className="w-full max-w-[720px] py-8 px-4">
            <div className="space-y-6">
              {/* TODO Section - learningObjectives がある場合のみ表示 */}
              <TodoSection items={article.learningObjectives} />

              {/* Rich Text Section - 記事本文 */}
              <RichTextSection content={article.content} isPremium={article.isPremium} />

              {/* Content Navigation - 前後の記事へのナビゲーション */}
              <ContentNavigation previous={navigation.previous} next={navigation.next} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArticleDetail;
