"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { ArticleWithContext } from "@/types/sanity";
import ArticleSideNavNew from "@/components/article/sidebar/ArticleSideNavNew";
import MobileMenuButton from "@/components/article/MobileMenuButton";
import MobileSideNav from "@/components/article/MobileSideNav";
import { useResizableSidebarWidth } from "@/hooks/useResizableSidebarWidth";
import {
  ArticleCompletionContext,
  type CompletionLevel,
} from "@/contexts/ArticleCompletionContext";
import { detectCompletionLevel } from "@/lib/completion-detection";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationModal } from "@/components/celebration/CelebrationModal";
import { QuestCompletionModal } from "@/components/celebration/QuestCompletionModal";
import { trackArticleView } from "@/lib/analytics";

interface ArticleDetailClientProps {
  article: ArticleWithContext;
  children: React.ReactNode;
}

/**
 * ArticleDetailClient
 * サイドバーの開閉状態やリサイズを管理するクライアントコンポーネント
 */
export default function ArticleDetailClient({
  article,
  children,
}: ArticleDetailClientProps) {
  // セレブレーションシステム
  const celebration = useCelebration();

  // GA4: 記事表示トラッキング
  useEffect(() => {
    trackArticleView({
      articleId: article._id,
      articleTitle: article.title,
      lessonId: article.lessonInfo?._id,
      category: article.articleType,
    });
  }, [article._id, article.title, article.lessonInfo?._id, article.articleType]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSideNavOpen, setIsDesktopSideNavOpen] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return true;
      const raw = window.localStorage.getItem("bono.articleSideNav.open");
      if (!raw) return true;
      return raw === "true";
    }
  );

  const lastOpenWidthRef = useRef<number>(320);

  // 進捗更新トリガー（インクリメントでサイドバーの再fetchを発火）
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0);

  // 共有される完了状態（複数CompletionButton間の同期用）
  const [sharedIsCompleted, setSharedIsCompleted] = useState<boolean | null>(null);

  // 完了レベル検知結果（BON-136 でセレブレーションに使用）
  const [completionLevel, setCompletionLevel] =
    useState<CompletionLevel | null>(null);
  const [completedQuestTitle, setCompletedQuestTitle] = useState<string | null>(
    null
  );
  const [completedLessonTitle, setCompletedLessonTitle] = useState<
    string | null
  >(null);

  // CompletionButton から呼ばれるコールバック
  const handleCompletionChange = useCallback(
    async (isCompleted: boolean) => {
      // 共有完了状態を更新（複数ボタンの同期）
      setSharedIsCompleted(isCompleted);
      // サイドバーの進捗を更新
      setProgressUpdateTrigger((prev) => prev + 1);

      if (isCompleted && article.lessonInfo?.quests && article.questInfo) {
        // 完了レベルを検知
        const result = await detectCompletionLevel({
          currentQuestId: article.questInfo._id,
          lessonId: article.lessonInfo._id,
          quests: article.lessonInfo.quests,
          lessonTitle: article.lessonInfo.title,
        });
        setCompletionLevel(result.level);
        setCompletedQuestTitle(result.questTitle ?? null);
        setCompletedLessonTitle(result.lessonTitle ?? null);
      } else if (isCompleted) {
        // questInfo がない場合でも記事完了セレブレーションを発火
        setCompletionLevel('article');
      } else {
        // 未完了に戻した場合
        setCompletionLevel(null);
        setCompletedQuestTitle(null);
        setCompletedLessonTitle(null);
      }
    },
    [article]
  );

  // completionLevel が変化したらセレブレーションを発火
  useEffect(() => {
    if (!completionLevel) return;

    switch (completionLevel) {
      case "article":
        celebration.celebrateArticleComplete();
        break;
      case "quest":
        if (completedQuestTitle) {
          celebration.celebrateQuestComplete(completedQuestTitle);
        }
        break;
      case "lesson":
        if (completedLessonTitle) {
          celebration.celebrateLessonComplete(completedLessonTitle);
        }
        break;
    }

    // 発火後にリセット
    setCompletionLevel(null);
    setCompletedQuestTitle(null);
    setCompletedLessonTitle(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionLevel]);

  const resetCompletionLevel = useCallback(() => {
    setCompletionLevel(null);
    setCompletedQuestTitle(null);
    setCompletedLessonTitle(null);
  }, []);

  // Context value（メモ化）
  const completionContextValue = useMemo(
    () => ({
      onCompletionChange: handleCompletionChange,
      completionLevel,
      completedQuestTitle,
      completedLessonTitle,
      resetCompletionLevel,
      sharedIsCompleted,
    }),
    [
      handleCompletionChange,
      completionLevel,
      completedQuestTitle,
      completedLessonTitle,
      resetCompletionLevel,
      sharedIsCompleted,
    ]
  );

  // リサイズ可能なサイドバー幅の管理
  const {
    width: sideNavWidth,
    setWidth: setSideNavWidth,
    handleProps: sideNavResizeHandleProps,
  } = useResizableSidebarWidth({
    storageKey: "bono.articleSideNav.width",
    defaultWidth: 320,
    minWidth: 280,
    maxWidth: 520,
    collapseThresholdPx: 24,
    onCollapseRequested: () => {
      setIsDesktopSideNavOpen(false);
    },
  });

  // 最後に開いていた幅を保持して、再オープン時に復元する
  useEffect(() => {
    if (typeof window === "undefined") return;
    const minWidth = 280;
    if (sideNavWidth > minWidth + 8) {
      lastOpenWidthRef.current = sideNavWidth;
      window.localStorage.setItem(
        "bono.articleSideNav.lastOpenWidth",
        String(sideNavWidth)
      );
    }
  }, [sideNavWidth]);

  // 初回: lastOpenWidth があればそれを採用
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(
      "bono.articleSideNav.lastOpenWidth"
    );
    if (!raw) return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    lastOpenWidthRef.current = parsed;
  }, []);

  // サイドナビの開閉状態を保存
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "bono.articleSideNav.open",
      String(isDesktopSideNavOpen)
    );
  }, [isDesktopSideNavOpen]);

  return (
    <ArticleCompletionContext.Provider value={completionContextValue}>
      <div className="min-h-screen">
        {/* モバイルメニューボタン（スマホのみ表示） */}
        <div className="fixed top-4 left-4 z-30 md:hidden">
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>

        {/* デスクトップ：サイドナビが閉じている時の「一覧」ボタン */}
        {!isDesktopSideNavOpen && (
          <div className="fixed top-4 left-4 z-30 hidden md:block">
            <MobileMenuButton
              isOpen={false}
              showLogoWhenClosed
              onClick={() => {
                setIsDesktopSideNavOpen(true);
                setSideNavWidth(lastOpenWidthRef.current);
              }}
            />
          </div>
        )}

        {/* モバイルサイドナビ（スマホのみ） */}
        <MobileSideNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          article={article}
          currentArticleId={article._id}
          progressUpdateTrigger={progressUpdateTrigger}
        />

        {/* 2カラムレイアウト */}
        <div className="flex w-full max-w-[1920px] mx-auto">
          {/* サイドナビゲーション - PC表示のみ */}
          {isDesktopSideNavOpen && (
            <aside
              className="hidden md:block flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
              style={{ width: sideNavWidth }}
            >
              <div className="relative h-full">
                {/* リサイズハンドル */}
                <div
                  className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-20 bg-transparent hover:bg-black/5 focus:bg-black/5 outline-none"
                  {...sideNavResizeHandleProps}
                />
                <ArticleSideNavNew
                  article={article}
                  currentArticleId={article._id}
                  progressUpdateTrigger={progressUpdateTrigger}
                  logoRightAction={
                    <MobileMenuButton
                      isOpen={true}
                      onClick={() => setIsDesktopSideNavOpen(false)}
                    />
                  }
                />
              </div>
            </aside>
          )}

          {/* メインコンテンツエリア */}
          {children}
        </div>
      </div>
      {/* セレブレーションモーダル */}
      <QuestCompletionModal
        isOpen={celebration.showQuestModal}
        onClose={celebration.closeQuestModal}
        questTitle={celebration.questModalTitle}
      />
      {celebration.lessonModalData && (
        <CelebrationModal
          isOpen={celebration.showLessonModal}
          onClose={celebration.closeLessonModal}
          mainTitle={celebration.lessonModalData.mainTitle}
          subTitle={celebration.lessonModalData.subTitle}
          body={celebration.lessonModalData.body}
          footer={celebration.lessonModalData.footer}
        />
      )}
    </ArticleCompletionContext.Provider>
  );
}
