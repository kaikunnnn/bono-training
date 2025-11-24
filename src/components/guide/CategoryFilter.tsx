import React from "react";
import { cn } from "@/lib/utils";
import type { GuideCategory } from "@/types/guide";
import { GUIDE_CATEGORIES } from "@/lib/guideCategories";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: GuideCategory | "all";
  onCategoryChange: (category: GuideCategory | "all") => void;
  className?: string;
}

/**
 * カテゴリフィルターコンポーネント
 * ガイド一覧ページでカテゴリを選択してフィルタリングする
 */
const CategoryFilter = ({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* すべて表示ボタン */}
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange("all")}
        className="transition-all"
      >
        すべて
      </Button>

      {/* カテゴリボタン */}
      {GUIDE_CATEGORIES.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id as GuideCategory)}
          className="transition-all"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
