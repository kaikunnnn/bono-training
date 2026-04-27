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
          <div
            className="self-stretch"
            style={{
              borderLeft: isQuestCompleted
                ? "1px dotted #10B981"
                : "1px dotted #E1E1E1",
            }}
          />
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
