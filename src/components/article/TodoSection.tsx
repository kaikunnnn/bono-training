interface TodoSectionProps {
  items?: string[];
}

/**
 * TodoSection コンポーネント
 * 「身につけること」セクション
 *
 * 仕様:
 * - learningObjectives がある場合のみ表示（条件付きレンダリング）
 * - カード全体: 720px幅、12pxボーダーラディウス、1px 1px 4px rgba(0,0,0,0.08) シャドウ
 * - ヘッダー: #F5F5F5 背景、10px 10px 0px 0px ボーダーラディウス
 * - 6x6px 円マーカー (rgba(23, 23, 23, 0.64))
 * - 14px Noto Sans JP Bold テキスト
 * - 項目間ギャップ: 12px
 */
const TodoSection = ({ items }: TodoSectionProps) => {
  // items がない、または空の場合は何も表示しない
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full bg-white rounded-xl p-[2px]"
      style={{
        boxShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* ヘッダーブロック */}
      <div
        className="bg-[#F5F5F5] px-4 py-[5px] flex items-center gap-2.5"
        style={{
          borderRadius: "10px 10px 0px 0px",
        }}
      >
        <h3
          className="text-xs font-bold leading-6 text-[#656668] m-0"
          style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
        >
          身につけること
        </h3>
      </div>

      {/* コンテンツラッパー */}
      <div className="px-2 py-3 flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2.5 px-2">
            {/* 6x6px 円マーカー */}
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
              style={{
                backgroundColor: "rgba(23, 23, 23, 0.64)",
              }}
            />

            {/* タスク内容テキスト */}
            <p
              className="text-sm font-bold leading-[19.6px] text-[#171717] m-0"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoSection;
