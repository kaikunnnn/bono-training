import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchContentType,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_COLORS,
} from "@/types/search";

interface SearchFiltersProps {
  selectedTypes: SearchContentType[];
  onTypeChange: (types: SearchContentType[]) => void;
  className?: string;
}

// Sanityに存在するコンテンツタイプのみ（roadmapは現在Sanityにない）
const ALL_TYPES: SearchContentType[] = ["lesson", "article", "guide"];

/**
 * 検索フィルターコンポーネント
 * コンテンツタイプでフィルタリング
 */
const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedTypes,
  onTypeChange,
  className,
}) => {
  const handleTypeToggle = (type: SearchContentType) => {
    if (selectedTypes.includes(type)) {
      // 選択解除
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      // 選択追加
      onTypeChange([...selectedTypes, type]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === ALL_TYPES.length) {
      // 全選択中なら全解除
      onTypeChange([]);
    } else {
      // そうでなければ全選択
      onTypeChange([...ALL_TYPES]);
    }
  };

  const isAllSelected = selectedTypes.length === 0 || selectedTypes.length === ALL_TYPES.length;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* 全て */}
      <button
        onClick={handleSelectAll}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
          isAllSelected
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        )}
      >
        すべて
      </button>

      {/* 各タイプ */}
      {ALL_TYPES.map((type) => {
        const isSelected = selectedTypes.includes(type);
        const colors = CONTENT_TYPE_COLORS[type];
        const icon = CONTENT_TYPE_ICONS[type];
        const label = CONTENT_TYPE_LABELS[type];

        return (
          <button
            key={type}
            onClick={() => handleTypeToggle(type)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
              isSelected
                ? cn(colors.bg, colors.text, "ring-2", `ring-${type === 'lesson' ? 'amber' : type === 'article' ? 'emerald' : type === 'guide' ? 'blue' : 'purple'}-300`)
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            )}
          >
            <span>{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default SearchFilters;
