import { useMemo } from "react";
import LogoBlock from "./LogoBlock";
import BackNavigation from "./BackNavigation";
import LessonSection from "./LessonSection";
import QuestBlock from "./QuestBlock";
import type { ArticleWithContext } from "@/types/sanity";

interface ArticleSideNavProps {
  article: ArticleWithContext;
  currentArticleId: string;
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
const ArticleSideNav = ({ article, currentArticleId }: ArticleSideNavProps) => {
  // サイドナビゲーション用のデータを整形
  const navData = useMemo(() => {
    if (!article.lessonInfo) {
      return null;
    }

    const lesson = article.lessonInfo;
    const quests = lesson.quests || [];

    // 進捗率の計算（仮: すべてのクエストの記事数から計算）
    const totalArticles = quests.reduce(
      (sum, quest) => sum + (quest.articles?.length || 0),
      0
    );
    // TODO: 実際の完了した記事数を取得して進捗を計算
    const progressPercent = totalArticles > 0 ? 0 : 0; // 仮に0%

    // 各クエストのデータを変換
    const questsData = quests.map((quest) => {
      // このクエストに現在の記事が含まれるか
      const isFocusQuest = quest.articles?.some((a) => a._id === currentArticleId) || false;

      const items = (quest.articles || []).map((a) => ({
        id: a._id,
        title: a.title,
        duration: a.videoDuration,
        slug: a.slug.current,
        isCompleted: false, // TODO: 実際の完了状態を取得
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
  }, [article, currentArticleId]);

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
