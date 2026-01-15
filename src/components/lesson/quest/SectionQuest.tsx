import { QuestHeader } from "./QuestHeader";
import { QuestCard } from "./QuestCard";

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
  videoDuration?: number;
  articleType: "video" | "text";
  tag?: string;
  isPremium?: boolean;
}

interface SectionQuestProps {
  /** クエスト番号 (1, 2, 3...) */
  questNumber: number;
  /** クエストタイトル */
  title: string;
  /** 説明文（現在未使用） */
  description?: string;
  /** ゴール説明 */
  goal?: string;
  /** 所要時間（分） */
  estTimeMins?: number;
  /** 記事リスト */
  articles: Article[];
  /** 完了した記事数（外部から渡す） */
  completedCount?: number;
  /** 完了した記事IDリスト */
  completedArticleIds?: string[];
}

/**
 * クエスト1ブロック全体（番号行 + 縦点線 + カード）
 *
 * このコンポーネントが「クエスト完了状態」を管理する
 *
 * @example
 * <SectionQuest
 *   questNumber={1}
 *   title="UIデザインサイクル習得の旅をはじめよう"
 *   goal="「UIデザインサイクル」を身に付ける..."
 *   articles={articles}
 *   completedArticleIds={['article-1', 'article-2']}
 * />
 */
export function SectionQuest({
  questNumber,
  title,
  goal,
  articles,
  completedCount,
  completedArticleIds = [],
}: SectionQuestProps) {
  const totalCount = articles.length;

  // 完了数は props から渡されるか、completedArticleIds から計算
  const actualCompletedCount =
    completedCount ??
    articles.filter((a) => completedArticleIds.includes(a._id)).length;

  // クエスト完了状態の判定
  const isQuestCompleted =
    actualCompletedCount === totalCount && totalCount > 0;

  return (
    <div>
      {/* クエスト番号行 */}
      <QuestHeader questNumber={questNumber} isCompleted={isQuestCompleted} />

      {/* カードエリア（縦点線 + カード） */}
      <div className="flex gap-3 md:gap-5 mt-[12px]">
        {/* 縦点線 */}
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

        {/* カード */}
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
