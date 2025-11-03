import React from "react";
import { cn } from "@/lib/utils";
import type { Guide } from "@/types/guide";
import GuideCard from "./GuideCard";

interface GuideGridProps {
  guides: Guide[];
  className?: string;
}

/**
 * ガイドグリッドコンポーネント
 */
const GuideGrid = ({ guides, className }: GuideGridProps) => {
  if (!guides || guides.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ガイド記事がまだありません</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {guides.map((guide) => (
        <GuideCard key={guide.slug} guide={guide} />
      ))}
    </div>
  );
};

export default GuideGrid;
