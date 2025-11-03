import React from "react";
import { cn } from "@/lib/utils";
import type { GuideCategory } from "@/types/guide";
import { getCategoryInfo } from "@/lib/guideCategories";
import * as LucideIcons from "lucide-react";

interface CategoryBadgeProps {
  category: GuideCategory;
  className?: string;
  showIcon?: boolean;
}

/**
 * カテゴリバッジコンポーネント
 */
const CategoryBadge = ({ category, className, showIcon = true }: CategoryBadgeProps) => {
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    return null;
  }

  // カテゴリごとの色設定
  const colorClasses = {
    career: "bg-blue-100 text-blue-700 border-blue-200",
    learning: "bg-green-100 text-green-700 border-green-200",
    industry: "bg-purple-100 text-purple-700 border-purple-200",
    tools: "bg-orange-100 text-orange-700 border-orange-200",
  };

  // アイコンの取得（lucide-reactから動的に）
  const iconName = categoryInfo.icon
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') as keyof typeof LucideIcons;

  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
        colorClasses[category],
        className
      )}
    >
      {showIcon && IconComponent && <IconComponent className="w-3.5 h-3.5" />}
      {categoryInfo.label}
    </span>
  );
};

export default CategoryBadge;
