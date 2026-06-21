import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * サイドバー専用のコンパクト検索ボックス
 * Figma 19:1718 準拠（外側 px-[15px] でメニュー項目と幅揃え、内側 rounded-[12px] / px-[13px] py-[5px] / gap-3）
 * submit で /search?q=... に遷移。すでに /search にいる場合は現在の tab パラメータを引き継ぐ
 */
const SidebarSearchBox: React.FC<{ className?: string }> = ({ className }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const next = new URLSearchParams();
    next.set("q", trimmed);
    // /search に既にいる場合のみ、tab を引き継ぐ（絞り込み状態の維持）
    const currentTab = new URLSearchParams(location.search).get("tab");
    if (currentTab && location.pathname === "/search") {
      next.set("tab", currentTab);
    }
    navigate(`/search?${next.toString()}`);
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full px-[15px]", className)}
      role="search"
    >
      <div
        className={cn(
          "flex items-center gap-3 bg-white border border-gray-200 rounded-[12px]",
          "px-[13px] py-[5px]",
          "focus-within:border-gray-900 transition-colors"
        )}
      >
        <Search
          className="w-5 h-5 text-gray-400 flex-shrink-0 pointer-events-none"
          strokeWidth={1.75}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="探す"
          aria-label="検索"
          className={cn(
            "w-full bg-transparent outline-none border-0",
            "font-noto-sans-jp text-[13px] tracking-tight leading-[28px]",
            "text-[#2F3037] placeholder:text-[#64748b]"
          )}
        />
      </div>
    </form>
  );
};

export default SidebarSearchBox;
