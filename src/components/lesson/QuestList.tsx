import { SectionQuest } from "./quest";

interface Article {
  _id: string;
  articleNumber: number; // ランタイムで付与
  title: string;
  slug: { current: string };
  thumbnail?: {
    asset?: {
      _ref?: string;
    };
  };
  thumbnailUrl?: string;
  videoUrl?: string;
  videoDuration?: number;
  /** Sanity記事タイプ（知識、イントロ、実践、チャレンジ、実演解説） */
  articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
  isPremium?: boolean;
}

interface Quest {
  _id: string;
  questNumber: number; // ランタイムで付与
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
}

interface QuestListProps {
  contentHeading?: string;
  quests: Quest[];
  questProgressMap?: Record<string, { completed: number; total: number; completedArticleIds: string[] }>;
}

export default function QuestList({ contentHeading, quests, questProgressMap = {} }: QuestListProps) {
  return (
    <div className="w-full">
      {/* コンテンツ見出し */}
      {contentHeading && (
        <h2 className="font-rounded-mplus font-bold text-2xl text-lesson-quest-title mb-6">
          {contentHeading}
        </h2>
      )}

      {/* クエストカード一覧 */}
      <div className="flex flex-col gap-[24px]">
        {quests.map((quest) => {
          const progress = questProgressMap[quest._id] || { completed: 0, total: quest.articles.length, completedArticleIds: [] };
          return (
            <SectionQuest
              key={quest._id}
              questNumber={quest.questNumber}
              title={quest.title}
              description={quest.description}
              goal={quest.goal}
              estTimeMins={quest.estTimeMins}
              articles={quest.articles}
              completedCount={progress.completed}
              completedArticleIds={progress.completedArticleIds}
            />
          );
        })}
      </div>
    </div>
  );
}
