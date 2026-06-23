"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import {
  SearchContentType,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
} from "@/types/search";

export type SearchTab = "ai" | "all" | SearchContentType;

interface SearchTabsProps {
  tab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  availableTypes?: SearchContentType[];
  className?: string;
}

const SearchTabs: React.FC<SearchTabsProps> = ({
  tab,
  onTabChange,
  availableTypes = ["lesson", "article", "guide"],
  className,
}) => {
  const tabs: { id: SearchTab; label: string; icon?: React.ReactNode }[] = [
    {
      id: "ai",
      label: "AIに聞く",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    { id: "all", label: "すべて" },
    ...availableTypes.map((type) => ({
      id: type as SearchTab,
      label: CONTENT_TYPE_LABELS[type],
      icon: (
        <span className="text-base leading-none">
          {CONTENT_TYPE_ICONS[type]}
        </span>
      ),
    })),
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
