import { cn } from "@/lib/utils";

interface CategoryTagProps {
  /** カテゴリ名 */
  category: string;
  /** カスタムクラス */
  className?: string;
}

/**
 * カテゴリタグ
 *
 * Figma仕様:
 * - 背景: #EBECED
 * - パディング: 5px 7px
 * - 角丸: 10px
 * - フォント: Noto Sans JP Medium, 12px
 * - 色: #0D221D
 *
 * @example
 * <CategoryTag category="UIデザイン" />
 */
export function CategoryTag({ category, className }: CategoryTagProps) {
  return (
    <div
      className={cn(
        "bg-[#ebeced] inline-flex items-center justify-center px-[7px] py-[5px] rounded-[10px]",
        className
      )}
    >
      <span className="font-noto-sans-jp font-medium text-[12px] text-[#0d221d] text-center leading-[10px]">
        {category}
      </span>
    </div>
  );
}

export default CategoryTag;
