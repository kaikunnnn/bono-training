// src/components/blog/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPagination } from "@/types/blog";

interface PaginationProps {
  pagination: BlogPagination;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      {/* 前のページボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>前へ</span>
      </Button>

      {/* ページ番号ボタン */}
      <div className="flex space-x-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-10 h-10"
          >
            {page}
          </Button>
        ))}
      </div>

      {/* 次のページボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center space-x-1"
      >
        <span>次へ</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Pagination;