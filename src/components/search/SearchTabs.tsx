"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { MenuIcons } from "@/components/layout/Sidebar/icons";

/** タブの種類 — 記事はガイドに統合済 */
export type SearchTab = "ai" | "all" | "lesson" | "guide";

interface SearchTabsProps {
  tab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  className?: string;
}

const SearchTabs: React.FC<SearchTabsProps> = ({
  tab,
  onTabChange,
  className,
}) => {
  const tabs: { id: SearchTab; label: string; icon?: React.ReactNode }[] = [
    {
      id: "ai",
      label: "AIに聞く",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    { id: "all", label: "すべて" },
    {
      id: "lesson",
      label: "レッスン",
      icon: <MenuIcons.lesson size={14} variant="Outline" />,
    },
    {
      id: "guide",
      label: "ガイド",
      icon: <MenuIcons.guide size={14} variant="Outline" />,
    },
  ];

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-gray-200",
        className
      )}
    >
      {tabs.map((t) => {
        const isActive = tab === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(t.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-4 pt-2 pb-[9px] text-sm font-medium tracking-tight transition-colors",
              isActive
                ? "text-black"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t.icon}
            {t.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-px bg-black" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SearchTabs;
