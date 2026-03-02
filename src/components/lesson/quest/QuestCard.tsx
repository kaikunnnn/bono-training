import { QuestCardHeader } from "./QuestCardHeader";
import { ArticleItem } from "./ArticleItem";

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
  /** Sanity記事タイプ（知識、イントロ、実践、チャレンジ、実演解説） */
  articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
  isPremium?: boolean;
}

interface QuestCardProps {
  /** クエストタイトル */
  title: string;
  /** ゴール説明（オプション） */
  goal?: string;
  /** 記事リスト */
  articles: Article[];
  /** 完了済み記事IDリスト */
  completedArticleIds?: string[];
}

/**
 * クエストカード全体（ヘッダー + 記事リスト）
 *
 * @example
 * <QuestCard
 *   title="UIデザインサイクル習得の旅をはじめよう"
 *   goal="「UIデザインサイクル」を身に付ける..."
 *   articles={articles}
 *   completedArticleIds={['article-1', 'article-2']}
 * />
 */
export function QuestCard({
  title,
  goal,
  articles,
  completedArticleIds = [],
}: QuestCardProps) {
  return (
    <div className="relative max-w-[743px] w-full">
      {/* オーバーレイ（角丸整合用） */}
      <div className="absolute inset-px rounded-[23px] pointer-events-none" />

      {/* 背景 + シャドウ */}
      <div className="bg-white rounded-[24px] shadow-[1px_1px_4px_rgba(0,0,0,0.08)] overflow-hidden w-full">
        {/* ヘッダー */}
        <QuestCardHeader title={title} goal={goal} />

        {/* 記事リスト */}
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
