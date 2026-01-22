import ArticleListItem, { type QuestArticleItemLayoutVariant } from "./ArticleListItem";
import type { TagType } from "./ArticleTag";

interface ArticleItemData {
  id: string;
  title: string;
  tag?: TagType;
  isCompleted: boolean;
  href: string;
}

interface QuestItemProps {
  questNumber: number;
  questTitle: string;
  articles: ArticleItemData[];
  activeArticleId?: string;
  articleItemLayoutVariant?: QuestArticleItemLayoutVariant;
}

/**
 * QuestNumber コンポーネント
 * クエスト番号バッジ
 *
 * Figma仕様:
 * - サイズ: 20x20px
 * - 背景: white、角丸5px
 * - shadow: 0px 1px 2px rgba(0,0,0,0.08)
 * - border: 1px solid #EFEFEF
 * - フォント: Dela Gothic One, 12px
 * - 色: #747474
 */
function QuestNumber({ number }: { number: number }) {
  return (
    <div className="w-5 h-5 px-1.5 py-1 bg-white rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-center items-center flex-shrink-0">
      <span className="text-neutral-500 text-xs font-normal leading-3 [text-shadow:_0px_1px_1px_rgb(0_0_0_/_0.10)]">
        {number}
      </span>
    </div>
  );
}

/**
 * HeadingQuest コンポーネント
 * クエストの見出し部分
 *
 * Figma仕様:
 * - 幅: 親要素に追従（レスポンシブ）
 * - padding: 14px
 * - border-bottom: 1px solid rgba(0,0,0,0.05)
 * - gap: 8px
 */
function HeadingQuest({ number, title }: { number: number; title: string }) {
  return (
    <div className="w-full p-3.5 border-b border-black/5 inline-flex items-center gap-2">
      <QuestNumber number={number} />
      <span className="flex-1 text-gray-900 text-xs font-bold font-rounded-mplus leading-3 truncate">
        {title}
      </span>
    </div>
  );
}

/**
 * QuestItem コンポーネント
 * クエスト（学習単元）を表示するカード
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - 幅: 親要素に追従（レスポンシブ）
 * - 背景: #FFFFFF
 * - 角丸: 20px
 * - shadow: 0px 0px 4px rgba(0,0,0,0.08)
 * - border: 1px solid rgba(0,0,0,0.05)
 */
export function QuestItem({
  questNumber,
  questTitle,
  articles,
  activeArticleId,
  articleItemLayoutVariant = "C",
}: QuestItemProps) {
  return (
    <div className="w-full bg-white rounded-[20px] shadow-none outline outline-1 outline-offset-[-1px] outline-black/5 flex flex-col items-stretch overflow-hidden">
      <HeadingQuest number={questNumber} title={questTitle} />

      {/* 記事リスト */}
      <div className="self-stretch py-1 flex flex-col items-start">
        {articles.map((article) => (
          <ArticleListItem
            key={article.id}
            title={article.title}
            tag={article.tag}
            isCompleted={article.isCompleted}
            isActive={article.id === activeArticleId}
            href={article.href}
            layoutVariant={articleItemLayoutVariant}
          />
        ))}
      </div>
    </div>
  );
}

export default QuestItem;
