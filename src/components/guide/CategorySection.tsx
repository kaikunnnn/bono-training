import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Guide, GuideCategory } from "@/types/guide";
import { getCategoryInfo } from "@/lib/guideCategories";
import ContentWrapper from "@/components/training/ContentWrapper";
import GuideGrid from "./GuideGrid";
import { ArrowRight } from "lucide-react";

interface CategorySectionProps {
  category: GuideCategory;
  guides: Guide[];
  className?: string;
  linkText?: string;
  linkHref?: string;
}

/**
 * カテゴリセクションコンポーネント
 */
const CategorySection = ({
  category,
  guides,
  className,
  linkText,
  linkHref,
}: CategorySectionProps) => {
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    return null;
  }

  // 空のカテゴリは非表示
  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12", className)}>
      <ContentWrapper>
        {/* セクションヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {categoryInfo.label}
            </h2>
            {linkText && linkHref && (
              <a
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                {linkText}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-gray-600">{categoryInfo.description}</p>
        </div>

        {/* ガイドグリッド */}
        <GuideGrid guides={guides} />
      </ContentWrapper>
    </section>
  );
};

export default CategorySection;
