import { QuestHeader } from "./QuestHeader";
import { QuestCard } from "./QuestCard";
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
  isLocked?: boolean;
}

interface SectionQuestProps {
  questNumber: number;
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
  completedCount?: number;
  completedArticleIds?: string[];
}

export function SectionQuest({
  questNumber,
  title,
  goal,
  articles,
  completedCount,
  completedArticleIds = [],
}: SectionQuestProps) {
  const totalCount = articles.length;

  const actualCompletedCount =
    completedCount ??
    articles.filter((a) => completedArticleIds.includes(a._id)).length;

  const isQuestCompleted =
    actualCompletedCount === totalCount && totalCount > 0;

  return (
    <div>
      <QuestHeader questNumber={questNumber} isCompleted={isQuestCompleted} />

      <div className="flex gap-3 md:gap-5 mt-[12px]">
        <div className="px-[7px] flex items-center">
          {isQuestCompleted ? (
            <div
              className="self-stretch w-px"
              style={{
                background: "linear-gradient(to bottom, rgba(255,75,111,0.68), rgba(38,119,143,0.68))",
                maskImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, black 2px, black 6px)",
                WebkitMaskImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, black 2px, black 6px)",
              }}
            />
          ) : (
            <div
              className="self-stretch"
              style={{
                borderLeft: "1px dotted #E1E1E1",
              }}
            />
          )}
        </div>

        <QuestCard
          title={title}
          goal={goal}
          articles={articles}
          completedArticleIds={completedArticleIds}
        />
      </div>
    </div>
  );
}
