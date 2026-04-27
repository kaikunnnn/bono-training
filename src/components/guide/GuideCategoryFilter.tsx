"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GUIDE_CATEGORIES } from "@/lib/guideCategories";
import { Briefcase, BookOpen, TrendingUp, Wrench } from "lucide-react";

const categoryIcons: Record<string, typeof Briefcase> = {
  career: Briefcase,
  learning: BookOpen,
  industry: TrendingUp,
  tools: Wrench,
};

interface GuideCategoryFilterProps {
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export function GuideCategoryFilter({
  categoryCounts,
  totalCount,
}: GuideCategoryFilterProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/guide"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
          !currentCategory
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        すべて ({totalCount})
      </Link>
      {GUIDE_CATEGORIES.map((cat) => {
        const Icon = categoryIcons[cat.id] || BookOpen;
        return (
          <Link
            key={cat.id}
            href={`/guide?category=${cat.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              currentCategory === cat.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.label} ({categoryCounts[cat.id] || 0})
          </Link>
        );
      })}
    </div>
  );
}

export default GuideCategoryFilter;
