"use client";

import { useMemo, type ReactNode } from "react";
import LogoBlock from "./LogoBlock";
import LessonDetailCard from "./LessonDetailCard";
import QuestItem from "./QuestItem";
import type { QuestArticleItemLayoutVariant } from "./ArticleListItem";
import type { ArticleWithContext } from "@/types/sanity";
import { calculateLessonProgress } from "@/lib/completion-detection-client";

interface ArticleSideNavNewProps {
  article: ArticleWithContext;
  currentArticleId: string;
  /** Client side で楽観的に管理される完了済み記事 ID 一覧（ArticleDetailClient から） */
  completedArticleIds: string[];
  /** 右サイド配置などでロゴをメイン側に出したい場合にfalse */
  showLogo?: boolean;
  /** ロゴブロック右側に置くアクション（例: 閉じるボタン） */
  logoRightAction?: ReactNode;
  /** QuestItem 内の記事行の表示パターン */
  questArticleItemLayoutVariant?: QuestArticleItemLayoutVariant;
}

/**
 * ArticleSideNavNew コンポーネント
 * サイドナビゲーション全体
 *
 * 進捗は ArticleDetailClient から props 経由で受け取り、Server Action を呼ばない。
 * 完了ボタンを押した際の楽観的更新が即時反映される。
 */
export function ArticleSideNavNew({
  article,
  currentArticleId,
  completedArticleIds,
  showLogo = true,
  logoRightAction,
  questArticleItemLayoutVariant = "B",
}: ArticleSideNavNewProps) {
  // サイドナビゲーション用のデータを整形
  const navData = useMemo(() => {
    if (!article.lessonInfo) {
      return null;
    }

    const lesson = article.lessonInfo;
    const quests = lesson.quests || [];

    // Client side で進捗を計算
    const { percentage } = calculateLessonProgress(
      quests.map((q) => ({ articles: (q.articles || []).map((a) => ({ _id: a._id })) })),
      completedArticleIds
    );

    // 各クエストのデータを変換
    const questsData = quests.map((quest) => {
      const articles = (quest.articles || []).map((a) => ({
        id: a._id,
        title: a.title,
        tag: a.articleType,
        isCompleted: completedArticleIds.includes(a._id),
        href: `/articles/${a.slug.current}`,
      }));

      return {
        id: quest._id,
        questNumber: quest.questNumber,
        questTitle: quest.title,
        articles,
      };
    });

    return {
      lessonSlug: lesson.slug.current,
      lessonTitle: lesson.title,
      lessonIcon: lesson.iconImage,
      lessonIconUrl: lesson.iconImageUrl || undefined,
      progressPercent: percentage,
      quests: questsData,
    };
  }, [article, completedArticleIds]);

  if (!navData) {
    return (
      <div className="p-4 text-sm text-gray-500">
        レッスン情報が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch w-full gap-4 p-4 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
      {/* ロゴブロック */}
      {showLogo && <LogoBlock rightAction={logoRightAction} />}

      {/* レッスン情報カード */}
      <LessonDetailCard
        iconUrl={navData.lessonIconUrl}
        icon={navData.lessonIcon}
        title={navData.lessonTitle}
        progress={navData.progressPercent}
        href={`/lessons/${navData.lessonSlug}`}
      />

      {/* クエストリスト */}
      <div className="flex flex-col gap-2 w-full">
        {navData.quests.map((quest) => (
          <QuestItem
            key={quest.id}
            questNumber={quest.questNumber}
            questTitle={quest.questTitle}
            articles={quest.articles}
            activeArticleId={currentArticleId}
            articleItemLayoutVariant={questArticleItemLayoutVariant}
          />
        ))}
      </div>
    </div>
  );
}

export default ArticleSideNavNew;
