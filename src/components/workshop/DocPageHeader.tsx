import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WORKSHOP_STEPS } from "@/lib/workshop/config";
import type { WorkshopDocMeta } from "@/lib/workshop/content";

interface DocPageHeaderProps {
  doc: WorkshopDocMeta;
}

/**
 * ドキュメントページの上部：トップに戻るリンク + ステップラベル + タイトル
 */
export default function DocPageHeader({ doc }: DocPageHeaderProps) {
  const step = WORKSHOP_STEPS.find((s) => s.id === doc.step);
  return (
    <header>
      <Link
        href="/docs/workshop"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        ワークショップトップに戻る
      </Link>

      <div className="mt-8">
        {step && (
          <p className="text-[12px] font-bold tracking-[0.18em] uppercase text-text-muted mb-3 font-line-seed-jp">
            {step.label ? `${step.label} — ${step.title}` : step.title}
          </p>
        )}
        <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.5] tracking-[-0.02em] text-text-primary font-line-seed-jp">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="mt-4 text-[15px] md:text-[16px] leading-[1.9] text-text-secondary font-line-seed-jp">
            {doc.description}
          </p>
        )}
      </div>
    </header>
  );
}
