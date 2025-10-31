import React from "react";
import { Link } from "react-router-dom";
import type { Guide } from "@/types/guide";
import { useGuides } from "@/hooks/useGuides";
import CategoryBadge from "./CategoryBadge";
import { Clock, ArrowRight } from "lucide-react";

interface RelatedGuidesProps {
  relatedSlugs: string[];
  currentSlug: string;
}

/**
 * 関連ガイド表示コンポーネント
 */
const RelatedGuides = ({ relatedSlugs, currentSlug }: RelatedGuidesProps) => {
  const { data: allGuides, isLoading } = useGuides();

  if (isLoading) {
    return (
      <div className="py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">関連記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!allGuides || !relatedSlugs || relatedSlugs.length === 0) {
    return null;
  }

  // relatedSlugsから実際のガイドデータを取得
  const relatedGuides = allGuides.filter(
    (guide) => relatedSlugs.includes(guide.slug) && guide.slug !== currentSlug
  );

  if (relatedGuides.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t border-gray-200 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">関連記事</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedGuides.map((guide) => (
            <Link
              key={guide.slug}
              to={`/guide/${guide.slug}`}
              className="block bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="mb-3">
                <CategoryBadge category={guide.category} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {guide.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{guide.readingTime}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedGuides;
