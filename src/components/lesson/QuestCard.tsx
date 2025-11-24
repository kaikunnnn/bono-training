import { ChevronRight, Check } from "lucide-react";
import ContentItem from "./ContentItem";

interface Article {
  _id: string;
  articleNumber: number; // ランタイムで付与
  title: string;
  slug: { current: string };
  thumbnail?: any;
  thumbnailUrl?: string;
  videoDuration?: number;
  isPremium?: boolean;
}

interface QuestCardProps {
  questNumber: number;
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
  completedCount?: number;
  completedArticleIds?: string[];
}

export default function QuestCard({
  questNumber,
  title,
  description,
  goal,
  estTimeMins,
  articles,
  completedCount = 0,
  completedArticleIds = [],
}: QuestCardProps) {
  // 所要時間の計算（分→日）
  const estimatedDays = estTimeMins ? Math.ceil(estTimeMins / (60 * 8)) : 0;

  // 完了数
  const totalCount = articles.length;

  // 全記事が完了しているか
  const isQuestCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className="mb-6">
      {/* クエスト番号 */}
      <div className="mb-3 flex items-center gap-5">
        {/* チェックボックスアイコン */}
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: isQuestCompleted ? '#10B981' : '#F3F3F3',
            border: isQuestCompleted ? '1px solid #10B981' : '1px solid rgba(0, 0, 0, 0.04)'
          }}
        >
          {isQuestCompleted && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </div>

        {/* クエスト番号テキスト */}
        <div className="flex items-baseline gap-1">
          <span
            className="font-noto-sans-jp text-xs text-lesson-quest-title inline-block"
            style={{ lineHeight: '1.2' }}
          >
            クエスト
          </span>
          <span
            className="font-luckiest text-[13px] text-lesson-quest-title inline-block"
            style={{ lineHeight: '1.2' }}
          >
            {String(questNumber).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* カードエリア全体（縦ボーダー + カード） */}
      <div className="flex gap-5">
        {/* 縦ボーダー */}
        <div className="px-[7px] flex items-center">
          <div
            className="self-stretch"
            style={{
              borderLeft: isQuestCompleted ? '1px dotted #10B981' : '1px dotted #E1E1E1'
            }}
          />
        </div>

        {/* カード */}
        <div className="w-[743px] bg-lesson-quest-card-bg rounded-[24px] shadow-quest-card overflow-hidden" style={{ outline: '1px solid rgba(0, 0, 0, 0.06)', outlineOffset: '-1px' }}>
        {/* ヘッダー */}
        <div className="px-8 py-5 border-b border-lesson-quest-divider">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* タイトル */}
              <h3 className="font-noto-sans-jp font-bold text-lg text-lesson-quest-title mb-2">
                {title}
              </h3>

              {/* ゴール */}
              {goal && (
                <p className="font-noto-sans-jp text-sm text-lesson-quest-detail mb-3">
                  {goal}
                </p>
              )}

              {/* メタ情報 */}
              <div className="flex items-center gap-4 text-xs">
                {estTimeMins && (
                  <span className="font-geist text-lesson-quest-meta">
                    目安: {estimatedDays}日
                  </span>
                )}
                <span className="font-geist text-lesson-quest-meta">
                  完了数: {completedCount}/{totalCount}
                </span>
              </div>
            </div>

            {/* 矢印ボタン */}
            <button className="flex-shrink-0 ml-4 p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* コンテンツリスト */}
        <div className="py-3">
          {articles.map((article) => (
            <ContentItem
              key={article._id}
              articleNumber={article.articleNumber}
              title={article.title}
              slug={article.slug.current}
              thumbnail={article.thumbnail}
              thumbnailUrl={article.thumbnailUrl}
              videoDuration={article.videoDuration}
              isCompleted={completedArticleIds.includes(article._id)}
              isPremium={article.isPremium}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
