import { useMemo, useState, useEffect } from "react";
import LogoBlock from "./LogoBlock";
import BackNavigation from "./BackNavigation";
import LessonSection from "./LessonSection";
import QuestBlock from "./QuestBlock";
import type { ArticleWithContext } from "@/types/sanity";
import { getLessonProgress, type LessonProgress } from "@/services/progress";

interface ArticleSideNavProps {
  article: ArticleWithContext;
  currentArticleId: string;
  progressUpdateTrigger?: number;
}

/**
 * ArticleSideNav コンポーネント
 * サイドナビゲーション全体の統合コンポーネント
 *
 * 構成:
 * 1. BackNavigation (レッスンページに戻る)
 * 2. LessonSection (レッスンカード + 進捗バー)
 * 3. QuestBlock[] (複数のクエストブロック)
 */
const ArticleSideNav = ({ article, currentArticleId, progressUpdateTrigger }: ArticleSideNavProps) => {
  const [progress, setProgress] = useState<LessonProgress | null>(null);

  // レッスンの進捗を取得
  useEffect(() => {
    const fetchProgress = async () => {
      if (!article.lessonInfo?._id || !article.lessonInfo?.quests) return;

      // すべてのクエストから記事IDを収集
      const articleIds: string[] = [];
      article.lessonInfo.quests.forEach(quest => {
        if (quest.articles) {
          articleIds.push(...quest.articles.map(a => a._id));
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
      // このクエストに現在の記事が含まれるか
      const isFocusQuest = quest.articles?.some((a) => a._id === currentArticleId) || false;

      const items = (quest.articles || []).map((a) => ({
        id: a._id,
        title: a.title,
        duration: a.videoDuration,
        slug: a.slug.current,
        isCompleted: completedArticleIds.includes(a._id),
        isFocus: a._id === currentArticleId,
      }));

      return {
        id: quest._id,
        questNumber: quest.questNumber,
        title: quest.title,
        items,
        isFocus: isFocusQuest,
      };
    });

    return {
      lessonSlug: lesson.slug.current,
      lessonTitle: lesson.title,
      lessonThumbnail: lesson.iconImage,
      progressPercent,
      quests: questsData,
    };
  }, [article, currentArticleId, progress]);

  if (!navData) {
    return (
      <div className="p-4 text-sm text-gray-500">
        レッスン情報が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-8">
      {/* ロゴブロック */}
      <LogoBlock />

      {/* レッスン詳細セクション（BackNavigation + LessonSection） */}
      <section
        className="flex flex-col w-full py-3"
        style={{ borderBottom: "1px solid #F0F0F0" }}
      >
        {/* ナビゲーション領域 */}
        <div className="flex flex-col w-full gap-2.5" style={{ padding: "0 12px" }}>
          <BackNavigation lessonSlug={navData.lessonSlug} />
        </div>

        {/* レッスン詳細 */}
        <div className="flex flex-col w-full gap-1" style={{ padding: "0 12px" }}>
          <LessonSection
            title={navData.lessonTitle}
            thumbnail={navData.lessonThumbnail}
            progressPercent={navData.progressPercent}
            lessonSlug={navData.lessonSlug}
          />
        </div>
      </section>

      {/* Quest Blocks */}
      <div className="flex flex-col gap-0 mt-6">
        {navData.quests.map((quest, index) => (
          <div key={quest.id}>
            <QuestBlock
              id={quest.id}
              questNumber={quest.questNumber}
              title={quest.title}
              items={quest.items}
              isFocus={quest.isFocus}
              onItemCheckChange={(questId, itemId, isChecked) => {
                console.log("Check changed:", { questId, itemId, isChecked });
                // TODO: 完了状態をサーバーに保存
              }}
            />
            {index < navData.quests.length - 1 && (
              <div
                style={{
                  width: "100%",
                  height: "0.5px",
                  backgroundColor: "rgba(0, 0, 0, 0.06)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleSideNav;
