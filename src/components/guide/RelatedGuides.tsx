import React from "react";
import RelatedContent, { type RelatedContentItem } from "@/components/common/RelatedContent";
import { useGuides } from "@/hooks/useGuides";
import { getCategoryInfo } from "@/lib/guideCategories";

interface RelatedGuidesProps {
  relatedSlugs: string[];
  currentSlug: string;
}

const RelatedGuides = ({ relatedSlugs, currentSlug }: RelatedGuidesProps) => {
  const { data: allGuides, isLoading } = useGuides();

  if (isLoading || !allGuides || relatedSlugs.length === 0) return null;

  const items: RelatedContentItem[] = allGuides
    .filter((g) => relatedSlugs.includes(g.slug) && g.slug !== currentSlug)
    .map((g) => ({
      slug: g.slug,
      title: g.title,
      description: g.description,
      thumbnail: g.thumbnail,
      categoryLabel: getCategoryInfo(g.category)?.label,
      href: `/guide/${g.slug}`,
    }));

  return <RelatedContent items={items} title="関連ガイド" />;
};

export default RelatedGuides;
