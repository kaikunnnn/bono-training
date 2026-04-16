import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface RelatedContentItem {
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  categoryLabel?: string;
  href: string;
}

interface RelatedContentProps {
  items: RelatedContentItem[];
  title?: string;
  className?: string;
}

/**
 * 関連コンテンツ共通コンポーネント
 * ガイド・レッスン等で使い回せる汎用カードグリッド
 */
const RelatedContent = ({
  items,
  title = "関連記事",
  className,
}: RelatedContentProps) => {
  if (items.length === 0) return null;

  return (
    <section className={cn("w-full border-t border-border pt-12 pb-16", className)}>
      <div className="max-w-[640px] mx-auto px-4">
        <h2 className="text-base font-bold text-foreground mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={item.href}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-white hover:bg-muted/50 transition-colors"
            >
              {item.thumbnail && (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                {item.categoryLabel && (
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {item.categoryLabel}
                  </p>
                )}
                <p className="text-[14px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedContent;
