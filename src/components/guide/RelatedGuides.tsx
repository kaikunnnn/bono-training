import type { Guide } from "@/types/guide";
import { GuideCard } from "./GuideCard";

interface RelatedGuidesProps {
  guides: Guide[];
}

export default function RelatedGuides({ guides }: RelatedGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <section className="w-full border-t border-border-light pt-12 pb-16">
      <div className="max-w-[648px] mx-auto px-4">
        <h2 className="text-xl font-bold text-text-primary mb-2 text-center font-rounded-mplus">
          おすすめのガイド
        </h2>
        <p className="text-text-muted text-center mb-8">
          こちらもよかったらどぞっ
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  );
}
