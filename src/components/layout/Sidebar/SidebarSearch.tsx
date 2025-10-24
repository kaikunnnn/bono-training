import React, { useState } from "react";
import { SidebarSearchProps } from "./types";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * サイドバー検索ボックスコンポーネント
 * Figma仕様:
 * - 外側padding: 10px 12px
 * - 入力フィールド:
 *   - height: 36px
 *   - background: #f3f4f6
 *   - 角丸: 10px
 *   - padding: 8px 12px
 *   - gap: 4px（アイコンとテキスト）
 * - アイコン: 16×16px, color: #99a1af
 * - プレースホルダー:
 *   - フォント: Inter, 14px, 400
 *   - カラー: #99a1af
 */
const SidebarSearch: React.FC<SidebarSearchProps> = ({
  placeholder = "検索",
  onSearch,
  className,
}) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className={cn("flex flex-row px-3 py-[10px] gap-[10px]", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-row items-center gap-1 px-3 py-2 h-9 bg-[#f3f4f6] rounded-[10px] border-none">
          <Search
            size={16}
            className="flex-shrink-0 text-[#99a1af]"
            strokeWidth={1.33}
          />
          <input
            type="search"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-sm font-normal leading-[16.94px] tracking-tight text-[#0a0a0a] placeholder:text-[#99a1af]"
            aria-label="サイト内検索"
            role="searchbox"
          />
        </div>
      </form>
    </div>
  );
};

export default SidebarSearch;
