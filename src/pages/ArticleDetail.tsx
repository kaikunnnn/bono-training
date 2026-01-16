import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getArticleWithContext } from "@/lib/sanity";
import type { ArticleWithContext } from "@/types/sanity";
import VideoSection from "@/components/article/VideoSection";
import HeadingSection from "@/components/article/HeadingSection";
import TodoSection from "@/components/article/TodoSection";
import RichTextSection from "@/components/article/RichTextSection";
import ContentNavigation from "@/components/article/ContentNavigation";
import ArticleSideNavNew from "@/components/article/sidebar/ArticleSideNavNew";
import MobileMenuButton from "@/components/article/MobileMenuButton";
import MobileSideNav from "@/components/article/MobileSideNav";
import { toggleBookmark, isBookmarked } from "@/services/bookmarks";
import { toggleArticleCompletion, getArticleProgress, getLessonProgress, getLessonStatus, removeLessonCompletion } from "@/services/progress";
import { useCelebration } from "@/hooks/useCelebration";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CelebrationModal } from "@/components/celebration/CelebrationModal";
import { QuestCompletionModal } from "@/components/celebration/QuestCompletionModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUndoConfirmDialog, setShowUndoConfirmDialog] = useState(false);

  // セレブレーション管理
  const {
    showQuestModal,
    questModalTitle,
    closeQuestModal,
    showLessonModal,
    lessonModalData,
    closeLessonModal,
    celebrateArticleComplete,
    celebrateQuestComplete,
    celebrateLessonComplete,
  } = useCelebration();

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

    console.log('[handleCompleteToggle] isCompleted:', isCompleted, 'lessonId:', article.lessonInfo._id);

    // 完了を解除しようとしている場合、レッスンが完了済みかチェック
    if (isCompleted) {
      const lessonStatus = await getLessonStatus(article.lessonInfo._id);
      console.log('[handleCompleteToggle] lessonStatus:', lessonStatus);

      if (lessonStatus === 'completed') {
        // 確認ダイアログを表示
        console.log('[handleCompleteToggle] Showing undo confirm dialog');
        setShowUndoConfirmDialog(true);
        return;
      }
    }

    // 通常の完了トグル処理
    await executeCompleteToggle();
  };

  // 実際の完了トグル処理（確認後にも呼ばれる）
  const executeCompleteToggle = async () => {
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

      // 完了にした場合のみセレブレーション判定
      if (result.isCompleted && article.lessonInfo?.quests) {
        // レッスン内の全記事IDを取得
        const allArticleIds: string[] = [];
        const questArticleMap: Record<string, string[]> = {};

        for (const quest of article.lessonInfo.quests) {
          const questArticleIds = quest.articles.map(a => a._id);
          allArticleIds.push(...questArticleIds);
          questArticleMap[quest._id] = questArticleIds;
        }

        // 最新の進捗を取得
        const progress = await getLessonProgress(article.lessonInfo._id, allArticleIds);

        // 現在の記事が属するクエストを特定
        const currentQuestId = article.questInfo?._id;
        const currentQuestTitle = article.questInfo?.title || '';

        // デバッグログ
        console.log('[Celebration Debug]', {
          currentArticleId: article._id,
          currentQuestId,
          currentQuestTitle,
          questArticleMap,
          progress,
          lessonQuests: article.lessonInfo.quests.map(q => ({ id: q._id, title: q.title })),
        });

        if (currentQuestId && questArticleMap[currentQuestId]) {
          const questArticleIds = questArticleMap[currentQuestId];
          const completedInQuest = questArticleIds.filter(id =>
            progress.completedArticleIds.includes(id)
          );

          console.log('[Celebration Debug] Quest progress:', {
            questArticleIds,
            completedInQuest,
            isQuestComplete: completedInQuest.length === questArticleIds.length,
            isLessonComplete: progress.percentage === 100,
          });

          // クエスト完了判定（全記事完了）
          if (completedInQuest.length === questArticleIds.length) {
            // レッスン完了判定（全クエスト完了）
            if (progress.percentage === 100) {
              console.log('[Celebration] 🎉 Lesson Complete!');
              celebrateLessonComplete(article.lessonInfo.title);
            } else {
              // クエスト完了のみ
              console.log('[Celebration] 🔥 Quest Complete!');
              celebrateQuestComplete(currentQuestTitle);
            }
          } else {
            // 記事完了のみ
            console.log('[Celebration] ✅ Article Complete');
            celebrateArticleComplete();
          }
        } else {
          // クエスト情報がない場合は記事完了のみ
          console.log('[Celebration] ⚠️ No quest info, showing article celebration');
          celebrateArticleComplete();
        }
      } else if (result.isCompleted) {
        // lessonInfo.quests がない場合もログ
        console.log('[Celebration] ⚠️ No lesson quests data:', {
          hasLessonInfo: !!article.lessonInfo,
          hasQuests: !!article.lessonInfo?.quests,
        });
        celebrateArticleComplete();
      }
    }
    setCompletionLoading(false);
  };

  // レッスン完了解除確認後のハンドラー
  const handleConfirmUndo = async () => {
    if (!article || !article.lessonInfo?._id) return;

    console.log('[handleConfirmUndo] User confirmed undo');
    setShowUndoConfirmDialog(false);
    setCompletionLoading(true);

    try {
      // レッスン完了を解除（トーストなし）
      const lessonResult = await removeLessonCompletion(article.lessonInfo._id, false);
      console.log('[handleConfirmUndo] removeLessonCompletion result:', lessonResult);

      // 記事の完了状態を解除
      const articleResult = await toggleArticleCompletion(article._id, article.lessonInfo._id);
      console.log('[handleConfirmUndo] toggleArticleCompletion result:', articleResult);

      if (articleResult.success) {
        setIsCompleted(articleResult.isCompleted);
        setProgressUpdateTrigger(prev => prev + 1);
      }
    } finally {
      setCompletionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
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
    <div className="min-h-screen bg-base">
      {/* クエスト完了モーダル（5秒後に自動で閉じる） */}
      <QuestCompletionModal
        isOpen={showQuestModal}
        onClose={closeQuestModal}
        questTitle={questModalTitle}
      />

      {/* レッスン完了モーダル */}
      {lessonModalData && (
        <CelebrationModal
          isOpen={showLessonModal}
          onClose={closeLessonModal}
          mainTitle={lessonModalData.mainTitle}
          subTitle={lessonModalData.subTitle}
          body={lessonModalData.body}
          footer={lessonModalData.footer}
        />
      )}

      {/* レッスン完了解除確認ダイアログ */}
      <AlertDialog open={showUndoConfirmDialog} onOpenChange={setShowUndoConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>レッスン完了を解除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このレッスンは完了済みです。記事の完了を解除すると、レッスン完了も解除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUndo}>解除する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* モバイルメニューボタン（スマホのみ表示） */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <MobileMenuButton
          isOpen={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      {/* モバイルサイドナビ（スマホのみ） */}
      <MobileSideNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        article={article}
        currentArticleId={article._id}
        progressUpdateTrigger={progressUpdateTrigger}
      />

      {/* 2カラムレイアウト: サイドナビゲーション (320px) + メインコンテンツ (720px) */}
      <div className="flex max-w-[1920px] mx-auto">
        {/* サイドナビゲーション - 固定320px幅（PC表示のみ） */}
        <aside className="hidden md:block w-[320px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
          <ArticleSideNavNew article={article} currentArticleId={article._id} progressUpdateTrigger={progressUpdateTrigger} />
        </aside>

        {/* メインコンテンツエリア */}
        <main className="flex-1 flex flex-col items-center">
          {/* Video Section - 1680px以上の画面で最大1320px、センター揃え */}
          <div className="w-full min-[1680px]:max-w-[1320px] min-[1680px]:px-8 min-[1680px]:pt-8 pt-16 md:pt-8">
            <VideoSection
              videoUrl={article.videoUrl}
              thumbnail={article.thumbnail}
              thumbnailUrl={article.thumbnailUrl}
              isPremium={article.isPremium}
            />
          </div>

          {/* 記事コンテンツ - 動画ブロックと同じ幅 */}
          <div className="w-full min-[1680px]:max-w-[1320px] min-[1680px]:px-8 py-8 px-4">
            <div className="flex flex-col gap-2">
              {/* Heading Section - 記事カード群の先頭へ移動 */}
              <HeadingSection
                tagType={article.articleType || "explain"}
                title={article.title}
                description={article.excerpt}
                onComplete={handleCompleteToggle}
                onFavorite={handleBookmarkToggle}
                onNext={navigation.next ? () => navigate(`/articles/${navigation.next.slug}`) : undefined}
                isBookmarked={bookmarked}
                bookmarkLoading={bookmarkLoading}
                isCompleted={isCompleted}
                completionLoading={completionLoading}
              />

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
