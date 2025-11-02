import QuestTitle from "./QuestTitle";
import ContentItem from "./ContentItem";

interface QuestItem {
  id: string;
  title: string;
  duration?: number;
  slug: string;
  isCompleted: boolean;
  isFocus: boolean;
}

interface QuestBlockProps {
  id: string;
  questNumber: number;
  title: string;
  items: QuestItem[];
  isFocus: boolean;
  onItemCheckChange?: (questId: string, itemId: string, isChecked: boolean) => void;
}

/**
 * QuestBlock コンポーネント
 * クエストブロック（Default / Focus の2状態）
 *
 * 仕様（side-navi_quest-block.md準拠）:
 * - 幅: 312px（固定）
 * - パディング: 0px 6px
 * - Default状態: ボーダーなし
 * - Focus状態: 下側のみ2px solid グラデーションボーダー
 * - グラデーション: 180deg, rgba(254,166,103,1) → rgba(196,113,245,1)
 * - ボーダーラディウス: なし（0px）
 */
const QuestBlock = ({
  id,
  questNumber,
  title,
  items,
  isFocus,
  onItemCheckChange,
}: QuestBlockProps) => {
  const handleCheckChange = (itemId: string, isChecked: boolean) => {
    onItemCheckChange?.(id, itemId, isChecked);
  };

  return (
    <div
      className={`w-[312px] flex flex-col bg-transparent px-1.5 py-3 transition-all duration-150`}
      style={
        isFocus
          ? {
              borderLeft: "2px solid transparent",
              borderImage:
                "linear-gradient(180deg, rgba(254, 166, 103, 1) 0%, rgba(196, 113, 245, 1) 100%) 1",
              borderImageSlice: "0 0 0 1",
            }
          : {}
      }
      data-state={isFocus ? "focus" : "default"}
      role="region"
      aria-label={`${title} - ${items.length}個のコンテンツ`}
    >
      {/* クエストタイトル */}
      <QuestTitle questNumber={questNumber} title={title} isFocus={isFocus} />

      {/* コンテンツリスト */}
      <div className="flex flex-col">
        {items.map((item) => (
          <ContentItem
            key={item.id}
            id={item.id}
            title={item.title}
            duration={item.duration}
            slug={item.slug}
            isCompleted={item.isCompleted}
            isFocus={item.isFocus}
            onCheckChange={(itemId, isChecked) =>
              handleCheckChange(itemId, isChecked)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default QuestBlock;
