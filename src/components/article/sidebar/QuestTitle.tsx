interface QuestTitleProps {
  questNumber: number;
  title: string;
  isFocus?: boolean;
}

/**
 * QuestTitle コンポーネント
 * クエストブロックのヘッダー部分
 *
 * 仕様（side-navi_quest-block.md準拠）:
 * - パディング: 12px 16px
 * - 背景: #FFFFFF（白）
 * - 番号ボックス: 16x16px、ボーダーラディウス5px
 * - Default: 番号ボックス背景#FFFFFF、ボーダー1.25px #787878、タイトル#787878
 * - Focus: 番号ボックス背景グラデーション、ボーダーなし、タイトル#101828
 * - 番号テキスト: 10px Hind 500、#787878（Default）、#FFFFFF（Focus）
 * - タイトル: 12px Noto Sans JP 700、#787878（Default）、#101828（Focus）
 * - ギャップ: 12px
 */
const QuestTitle = ({ questNumber, title, isFocus = false }: QuestTitleProps) => {
  return (
    <div className="flex flex-col w-full bg-white" style={{ gap: "10px", padding: "12px 16px" }}>
      <div className="flex items-center w-full" style={{ gap: "12px" }}>
        {/* 番号ボックス 16x16px */}
        <div
          className={`w-4 h-4 flex items-center justify-center rounded-[5px] flex-shrink-0 transition-all duration-150`}
          style={
            isFocus
              ? {
                  background: "linear-gradient(180deg, rgba(254, 166, 103, 1) 0%, rgba(196, 113, 245, 1) 100%)",
                  border: "none",
                }
              : {
                  backgroundColor: "#FFFFFF",
                  border: "1.25px solid #787878",
                }
          }
        >
          <span
            className={`text-[10px] font-medium leading-[1em] text-center transition-colors`}
            style={{
              fontFamily: "Hind, sans-serif",
              color: isFocus ? "#FFFFFF" : "#787878",
              width: "7px",
              height: "8px",
            }}
          >
            {questNumber}
          </span>
        </div>

        {/* タイトル */}
        <h2
          className={`text-xs font-bold leading-[1em] m-0 flex-1 transition-colors`}
          style={{
            fontFamily: '"Noto Sans JP", sans-serif',
            color: isFocus ? "#101828" : "#787878",
            textAlign: "left",
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
};

export default QuestTitle;
