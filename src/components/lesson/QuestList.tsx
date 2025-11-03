import QuestCard from "./QuestCard";

interface Article {
  _id: string;
  articleNumber: number; // ランタイムで付与
  title: string;
  slug: { current: string };
  thumbnail?: any;
  videoDuration?: number;
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
    <div className="w-full max-w-3xl mx-auto">
      {/* コンテンツ見出し */}
      {contentHeading && (
        <h2 className="font-rounded-mplus font-bold text-2xl text-lesson-quest-title mb-6">
          {contentHeading}
        </h2>
      )}

      {/* クエストカード一覧 */}
      <div>
        {quests.map((quest) => {
          const progress = questProgressMap[quest._id] || { completed: 0, total: quest.articles.length, completedArticleIds: [] };
          return (
            <QuestCard
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
