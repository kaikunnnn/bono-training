import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WorkshopDocMeta } from "@/lib/workshop/content";

interface DocCardProps {
  doc: WorkshopDocMeta;
}

/**
 * ステップ内のドキュメントカード（白カード・クリッカブル）
 */
export default function DocCard({ doc }: DocCardProps) {
  return (
    <Link
      href={`/docs/workshop/${doc.slug}`}
      className="group flex items-center gap-4 bg-surface border border-border-light rounded-[16px] px-5 py-4 md:px-6 md:py-5 shadow-quest-card transition-all duration-200 hover:shadow-training-card hover:-translate-y-0.5"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[16px] md:text-[17px] font-bold leading-[1.6] text-text-primary font-rounded-mplus">
            {doc.title}
          </h3>
          {doc.note && (
            <span className="text-[11px] font-semibold text-text-muted border border-border-light rounded-full px-2 py-0.5 whitespace-nowrap">
              {doc.note}
            </span>
          )}
        </div>
        {doc.description && (
          <p className="mt-1 text-[13px] md:text-[14px] leading-[1.8] text-text-muted font-noto-sans-jp">
            {doc.description}
          </p>
        )}
      </div>
      <ArrowRight
        size={18}
        className="shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
