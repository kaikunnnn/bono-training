"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FeedbackCategory } from "@/types/sanity";

interface CategoryTabsProps {
  categories: FeedbackCategory[];
  feedbackCounts: Record<string, number>;
  totalCount: number;
}

export function CategoryTabs({ categories, feedbackCounts, totalCount }: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/feedbacks"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !currentCategory
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        すべて ({totalCount})
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat._id}
          href={`/feedbacks?category=${cat.slug.current}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentCategory === cat.slug.current
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.title} ({feedbackCounts[cat.slug.current] || 0})
        </Link>
      ))}
    </div>
  );
}

export default CategoryTabs;
