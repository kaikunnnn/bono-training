import React from 'react';

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
const DottedSeparator: React.FC<DottedSeparatorProps> = ({
  className = '',
  dotSize = 1,
  spacing = 6,
  color = '#D1D5DB'
}) => {
  const patternWidth = (dotSize * 2) + spacing;
  const centerX = patternWidth / 2;
  const centerY = 4;
  
  return (
    <div className={`w-full my-4 ${className}`}>
      <svg className="w-full h-2">
        <defs>
          <pattern 
            id="dotPattern" 
            x="0" 
            y="0" 
            width={patternWidth} 
            height="8" 
            patternUnits="userSpaceOnUse"
          >
            <circle cx={centerX} cy={centerY} r={dotSize} fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>
    </div>
  );
};

export default DottedSeparator;