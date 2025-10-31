import QuestCard from "./QuestCard";

interface Article {
  _id: string;
  articleNumber: number;
  title: string;
  slug: { current: string };
  thumbnail?: any;
  videoDuration?: number;
}

interface Quest {
  _id: string;
  questNumber: number;
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
}

interface QuestListProps {
  contentHeading?: string;
  quests: Quest[];
}

export default function QuestList({ contentHeading, quests }: QuestListProps) {
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
        {quests.map((quest) => (
          <QuestCard
            key={quest._id}
            questNumber={quest.questNumber}
            title={quest.title}
            description={quest.description}
            goal={quest.goal}
            estTimeMins={quest.estTimeMins}
            articles={quest.articles}
          />
        ))}
      </div>
    </div>
  );
}
