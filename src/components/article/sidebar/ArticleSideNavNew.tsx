import { useMemo, useState, useEffect } from "react";
import LogoBlock from "./LogoBlock";
import LessonDetailCard from "./LessonDetailCard";
import QuestItem from "./QuestItem";
import type { QuestArticleItemLayoutVariant } from "./ArticleListItem";
import type { ArticleWithContext } from "@/types/sanity";
import { getLessonProgress, type LessonProgress } from "@/services/progress";

interface ArticleSideNavNewProps {
  article: ArticleWithContext;
  currentArticleId: string;
  progressUpdateTrigger?: number;
  /** 右サイド配置などでロゴをメイン側に出したい場合にfalse */
  showLogo?: boolean;
  /** QuestItem 内の記事行の表示パターン（/dev/quest-layouts と合わせる） */
  questArticleItemLayoutVariant?: QuestArticleItemLayoutVariant;
}

/**
 * ArticleSideNavNew コンポーネント
 * サイドナビゲーション全体（Figma新デザイン）
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * 構成:
 * 1. LogoBlock (BONOロゴ)
 * 2. LessonDetailCard (レッスン情報カード + 進捗バー)
 * 3. QuestItem[] (クエストカードリスト)
 */
export function ArticleSideNavNew({
  article,
  currentArticleId,
  progressUpdateTrigger,
  showLogo = true,
  questArticleItemLayoutVariant = "B",
}: ArticleSideNavNewProps) {
  const [progress, setProgress] = useState<LessonProgress | null>(null);

  // レッスンの進捗を取得
  useEffect(() => {
    const fetchProgress = async () => {
      if (!article.lessonInfo?._id || !article.lessonInfo?.quests) return;

      // すべてのクエストから記事IDを収集
      const articleIds: string[] = [];
      article.lessonInfo.quests.forEach((quest) => {
        if (quest.articles) {
          articleIds.push(...quest.articles.map((a) => a._id));
        }
      });

      if (articleIds.length === 0) return;

      const lessonProgress = await getLessonProgress(
        article.lessonInfo._id,
        articleIds
      );

      setProgress(lessonProgress);
    };

    fetchProgress();
  }, [article.lessonInfo, progressUpdateTrigger]);

  // サイドナビゲーション用のデータを整形
  const navData = useMemo(() => {
    if (!article.lessonInfo) {
      return null;
    }

    const lesson = article.lessonInfo;
    const quests = lesson.quests || [];

    // 実際の進捗データを使用
    const progressPercent = progress?.percentage || 0;
    const completedArticleIds = progress?.completedArticleIds || [];

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
      progressPercent,
      quests: questsData,
    };
  }, [article, progress]);

  if (!navData) {
    return (
      <div className="p-4 text-sm text-gray-500">
        レッスン情報が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
      {/* ロゴブロック */}
      {showLogo && <LogoBlock />}

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
