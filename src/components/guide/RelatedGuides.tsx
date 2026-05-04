import Link from "next/link";
import type { Guide } from "@/types/guide";
import { getCategoryInfo } from "@/lib/guideCategories";
import { GuideCardImage } from "./GuideCardImage";

interface RelatedGuidesProps {
  guides: Guide[];
}

/**
 * 関連ガイドセクション
 * mainのRelatedContentコンポーネントに合わせたデザイン
 */
export default function RelatedGuides({ guides }: RelatedGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <section className="w-full border-t border-border pt-12 pb-16">
      <div className="max-w-[640px] mx-auto px-4">
        <h2 className="text-base font-bold text-foreground mb-6">関連ガイド</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map((guide) => {
            const categoryInfo = getCategoryInfo(guide.category);
            return (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-white hover:bg-muted/50 transition-colors"
              >
                {guide.thumbnail && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <GuideCardImage src={guide.thumbnail} alt={guide.title} />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {categoryInfo && (
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {categoryInfo.label}
                    </p>
                  )}
                  <p className="text-[14px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors">
                    {guide.title}
                  </p>
                  {guide.description && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                      {guide.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
