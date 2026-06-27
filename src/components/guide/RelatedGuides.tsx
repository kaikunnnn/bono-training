import Link from "next/link";
import type { Guide } from "@/types/guide";
import { GuideCard } from "./GuideCard";
import { ArrowRight } from "lucide-react";

interface RelatedGuidesProps {
  guides: Guide[];
}

export default function RelatedGuides({ guides }: RelatedGuidesProps) {
  return (
    <section className="w-full border-t border-border-light pt-12 pb-16">
      <div className="max-w-[648px] mx-auto px-4">
        <h2 className="text-xl font-bold text-text-primary mb-2 text-center font-rounded-mplus">
          もっと読む
        </h2>
        <p className="text-text-muted text-center mb-8">
          こちらもよかったらどぞっ
        </p>

        {guides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-full border border-border-default px-5 py-2.5 text-sm font-bold text-text-primary hover:bg-bg-hover transition-colors"
            >
              一覧をみる
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
