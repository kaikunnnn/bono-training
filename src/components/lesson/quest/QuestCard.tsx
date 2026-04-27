import { QuestCardHeader } from "./QuestCardHeader";
import { ArticleItem } from "./ArticleItem";
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

interface QuestCardProps {
  title: string;
  goal?: string;
  articles: Article[];
  completedArticleIds?: string[];
}

export function QuestCard({
  title,
  goal,
  articles,
  completedArticleIds = [],
}: QuestCardProps) {
  return (
    <div className="relative max-w-[743px] w-full">
      <div className="absolute inset-px rounded-[23px] pointer-events-none" />

      <div className="bg-white rounded-[24px] shadow-[1px_1px_4px_rgba(0,0,0,0.08)] overflow-hidden w-full">
        <QuestCardHeader title={title} goal={goal} />

        <div className="flex flex-col items-start w-full">
          {articles.map((article, index) => (
            <ArticleItem
              key={article._id}
              articleNumber={index + 1}
              title={article.title}
              slug={article.slug.current}
              thumbnail={article.thumbnail}
              thumbnailUrl={article.thumbnailUrl}
              videoUrl={article.videoUrl}
              videoDuration={article.videoDuration}
              articleType={article.articleType}
              isCompleted={completedArticleIds.includes(article._id)}
              isPremium={article.isPremium}
              isLocked={article.isLocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
