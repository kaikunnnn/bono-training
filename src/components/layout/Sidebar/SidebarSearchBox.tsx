"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * サイドバー専用のコンパクト検索ボックス
 * Figma 19:1718 準拠（外側 px-[15px] でメニュー項目と幅揃え、内側 rounded-[12px] / px-[13px] py-[5px] / gap-3）
 * submit で /search?q=... に遷移。すでに /search にいる場合は現在の tab パラメータを引き継ぐ
 */
const SidebarSearchBox: React.FC<{ className?: string }> = ({ className }) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const next = new URLSearchParams();
    next.set("q", trimmed);
    // /search に既にいる場合のみ、tab を引き継ぐ（絞り込み状態の維持）
    // ※ useSearchParams は static prerender で Suspense 要求するため、
    //   submit 時のみ window.location.search から読む（クライアント実行のみ）
    if (typeof window !== "undefined" && pathname === "/search") {
      const currentTab = new URLSearchParams(window.location.search).get("tab");
      if (currentTab) next.set("tab", currentTab);
    }
    router.push(`/search?${next.toString()}`);
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full pl-[30px] pr-[15px]", className)}
      role="search"
    >
      <div
        className={cn(
          "flex items-center gap-[12px] bg-white border border-gray-200 rounded-[12px]",
          "px-[14px] py-[5px]",
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
