/**
 * BONO Blog - Pagination Component
 *
 * 99frontend 仕様に基づくページネーションコンポーネント
 *
 * @component Pagination
 * @description ブログ記事のページネーション機能を提供するコンポーネント
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogPagination } from '@/types/blog';
import { BLOG_COLORS, BLOG_SPACING } from '@/styles/design-tokens';

interface PaginationProps {
  /** ページネーション情報 */
  pagination: BlogPagination;
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void;
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * Pagination Component
 *
 * 99frontend仕様に準拠したページネーション。
 *
 * 仕様:
 * - ボタンサイズ: 40px × 40px
 * - フォント: Hind, 14px, Medium
 * - ボーダーラディウス: 8px
 * - アクティブページ: 背景色 #0F172A, テキスト色 #FFFFFF
 *
 * @example
 * ```tsx
 * <Pagination
 *   pagination={paginationData}
 *   onPageChange={handlePageChange}
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  className = '',
}) => {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  // ページ番号の配列を生成
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 大量のページがある場合は省略表示
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= 7) {
      return pages;
    }

    const visible: (number | string)[] = [];

    if (currentPage <= 3) {
      visible.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      visible.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      visible.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return visible;
  };

  const visiblePages = getVisiblePages();

  const buttonStyle = (isActive: boolean, isDisabled: boolean = false) => ({
    width: BLOG_SPACING.pagination.buttonSize,
    height: BLOG_SPACING.pagination.buttonSize,
    borderRadius: BLOG_SPACING.pagination.buttonBorderRadius,
    border: `1px solid ${BLOG_COLORS.border}`,
    backgroundColor: isActive ? BLOG_COLORS.darkBlue : BLOG_COLORS.white,
    color: isActive ? BLOG_COLORS.white : isDisabled ? '#D1D5DB' : BLOG_COLORS.gray,
    fontFamily: "'Hind', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  });

  return (
    <nav
      className={`flex items-center justify-center mt-12 ${className}`}
      style={{ gap: BLOG_SPACING.pagination.gap }}
      role="navigation"
      aria-label="ページネーション"
    >
      {/* 前のページボタン */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="flex items-center gap-1 blog-focus-visible"
        style={buttonStyle(false, !hasPrevPage)}
        aria-label="前のページ"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">前へ</span>
      </button>

      {/* ページ番号ボタン */}
      <div className="flex" style={{ gap: BLOG_SPACING.pagination.gap }}>
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center"
                style={{
                  width: BLOG_SPACING.pagination.buttonSize,
                  color: BLOG_COLORS.gray,
                }}
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className="blog-focus-visible"
              style={buttonStyle(currentPage === page)}
              aria-label={`ページ ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* 次のページボタン */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="flex items-center gap-1 blog-focus-visible"
        style={buttonStyle(false, !hasNextPage)}
        aria-label="次のページ"
      >
        <span className="hidden sm:inline">次へ</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* ホバー効果用のスタイル */}
      <style>{`
        button:not([disabled]):not([aria-current="page"]):hover {
          background-color: #f5f5f5;
          color: ${BLOG_COLORS.darkBlue};
        }
      `}</style>
    </nav>
  );
};

export default Pagination;