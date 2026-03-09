/**
 * RoadmapBadge - ロードマップラベルコンポーネント
 * 青いドット + "ロードマップ" テキスト
 */
import React from 'react';

interface RoadmapBadgeProps {
  label?: string;
  className?: string;
}

export const RoadmapBadge: React.FC<RoadmapBadgeProps> = ({
  label = 'ロードマップ',
  className = '',
}) => {
  return (
    <div
      className={`
        inline-flex items-center gap-2
        h-6 px-3
        border border-black rounded-full
        ${className}
      `}
    >
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-90" />
      <span className="text-xs font-bold tracking-wider uppercase text-black">
        {label}
      </span>
    </div>
  );
};

export default RoadmapBadge;
