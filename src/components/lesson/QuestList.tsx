import { SectionQuest } from "./quest";
import type { TagType } from "@/components/article/sidebar/ArticleTag";

interface Article {
  _id: string;
  articleNumber: number;
  title: string;
  slug: { current: string };
  thumbnail?: {
    asset?: {
      _ref?: string;
    };
  };
  thumbnailUrl?: string;
  videoUrl?: string;
  videoDuration?: string | number;
  articleType?: TagType;
  isPremium?: boolean;
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
  questProgressMap?: Record<string, { completed: number; total: number; completedArticleIds: string[] }>;
}

export default function QuestList({ contentHeading, quests, questProgressMap = {} }: QuestListProps) {
  return (
    <div className="w-full">
      {contentHeading && (
        <h2 className="font-rounded-mplus font-bold text-2xl text-lesson-quest-title mb-6">
          {contentHeading}
        </h2>
      )}

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
