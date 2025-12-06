/**
 * BONO Blog - Category Filter Component
 *
 * 99frontend 仕様に基づくカテゴリフィルターコンポーネント
 *
 * @component CategoryFilter
 * @description カテゴリによる記事フィルタリング機能を提供するコンポーネント
 */

import React from 'react';
import { BlogCategory } from '@/types/blog';
import { BLOG_COLORS, BLOG_SPACING } from '@/styles/design-tokens';

interface CategoryFilterProps {
  /** カテゴリデータの配列 */
  categories: BlogCategory[];
  /** 選択中のカテゴリスラッグ */
  selectedCategory?: string | null;
  /** カテゴリ変更時のコールバック */
  onCategoryChange: (category: string | null) => void;
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * CategoryFilter Component
 *
 * 99frontend仕様に準拠したカテゴリフィルター。
 *
 * 仕様:
 * - フォント: Hind, 14px, Medium
 * - ボーダー: 1px solid #E5E7EB
 * - ボーダーラディウス: 8px
 * - ホバー: 背景色変化
 * - アクティブ: 背景色 #0F172A, テキスト色 #FFFFFF
 *
 * @example
 * ```tsx
 * <CategoryFilter
 *   categories={categories}
 *   selectedCategory="bono"
 *   onCategoryChange={handleCategoryChange}
 * />
 * ```
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap justify-center items-center ${className}`}
      style={{
        gap: BLOG_SPACING.categoryFilter.gap,
        padding: '24px 0',
      }}
      role="navigation"
      aria-label="カテゴリフィルター"
    >
      {/* すべてのカテゴリボタン */}
      <button
        onClick={() => onCategoryChange(null)}
        className="font-hind font-medium transition-all duration-200 blog-focus-visible"
        style={{
          padding: BLOG_SPACING.categoryFilter.buttonPadding,
          fontSize: '14px',
          lineHeight: '16px',
          borderRadius: BLOG_SPACING.categoryFilter.buttonBorderRadius,
          border: `1px solid ${BLOG_COLORS.border}`,
          backgroundColor:
            selectedCategory === null ? BLOG_COLORS.darkBlue : BLOG_COLORS.white,
          color:
            selectedCategory === null ? BLOG_COLORS.white : BLOG_COLORS.gray,
        }}
        aria-label="すべてのカテゴリを表示"
        aria-current={selectedCategory === null ? 'page' : undefined}
      >
        すべて
      </button>

      {/* カテゴリボタン */}
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onCategoryChange(category.slug)}
          className="font-hind font-medium transition-all duration-200 blog-focus-visible flex items-center gap-2"
          style={{
            padding: BLOG_SPACING.categoryFilter.buttonPadding,
            fontSize: '14px',
            lineHeight: '16px',
            borderRadius: BLOG_SPACING.categoryFilter.buttonBorderRadius,
            border: `1px solid ${BLOG_COLORS.border}`,
            backgroundColor:
              selectedCategory === category.slug
                ? BLOG_COLORS.darkBlue
                : BLOG_COLORS.white,
            color:
              selectedCategory === category.slug
                ? BLOG_COLORS.white
                : BLOG_COLORS.gray,
          }}
          aria-label={`${category.name}カテゴリを表示`}
          aria-current={selectedCategory === category.slug ? 'page' : undefined}
        >
          {category.name}
        </button>
      ))}

      {/* ホバー効果用のスタイル */}
      <style>{`
        button:not([aria-current="page"]):hover {
          background-color: #f5f5f5;
          color: ${BLOG_COLORS.darkBlue};
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;