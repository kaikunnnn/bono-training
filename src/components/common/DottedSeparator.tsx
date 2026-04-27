interface DottedSeparatorProps {
  className?: string;
  dotSize?: number;
  spacing?: number;
  color?: string;
}

/**
 * 丸いドット境界線コンポーネント
 *
 * @param dotSize - ドットの半径（デフォルト: 1）
 * @param spacing - ドット間の間隔（デフォルト: 6px）
 * @param color - ドットの色（デフォルト: #D1D5DB）
 */
export function DottedSeparator({
  className = "",
  dotSize = 1,
  spacing = 6,
  color = "#D1D5DB",
}: DottedSeparatorProps) {
  const patternWidth = dotSize * 2 + spacing;
  const centerX = patternWidth / 2;
  const centerY = 4;

  // パターンIDをユニークにする
  const patternId = `dotPattern-${dotSize}-${spacing}`;

  return (
    <div className={`w-full my-4 ${className}`}>
      <svg className="w-full h-2">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={patternWidth}
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx={centerX} cy={centerY} r={dotSize} fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

export default DottedSeparator;
