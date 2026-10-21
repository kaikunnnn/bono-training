import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WORKSHOP_STEPS, type WorkshopStep } from "@/lib/workshop/config";
import type { WorkshopDocMeta } from "@/lib/workshop/content";

interface DocPageHeaderProps {
  doc: WorkshopDocMeta;
  /** ステップ構成（既定: ワークショップ） */
  steps?: WorkshopStep[];
  /** トップのパス（既定: /docs/workshop） */
  basePath?: string;
  /** 戻るリンクの文言 */
  backLabel?: string;
}

/**
 * ドキュメントページの上部：トップに戻るリンク + ステップラベル + タイトル
 */
export default function DocPageHeader({
  doc,
  steps = WORKSHOP_STEPS,
  basePath = "/docs/workshop",
  backLabel = "ワークショップトップに戻る",
}: DocPageHeaderProps) {
  const step = steps.find((s) => s.id === doc.step);
  return (
    <header>
      <Link
        href={basePath}
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </Link>

      <div className="mt-8">
        {step && (
          <p className="text-[12px] font-bold tracking-[0.18em] uppercase text-text-muted mb-3 font-line-seed-jp">
            {step.label ? `${step.label} — ${step.title}` : step.title}
          </p>
        )}
        {doc.number ? (
          // 記事番号つき（例: 数字改善チャレンジ）。h1 のテキストにも番号と役割を含める
          <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.5] tracking-[-0.02em] text-text-primary font-line-seed-jp">
            <span className="block mb-1 text-[15px] md:text-[17px] font-bold tracking-[0.04em] text-text-muted">
              {`STEP ${doc.number}${doc.role ? ` ${doc.role}` : ""}`}
              <span className="sr-only">｜</span>
            </span>
            {doc.title}
          </h1>
        ) : (
          <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.5] tracking-[-0.02em] text-text-primary font-line-seed-jp">
            {doc.title}
          </h1>
        )}
        {doc.description && (
          <p className="mt-4 text-[15px] md:text-[16px] leading-[1.9] text-text-secondary font-line-seed-jp">
            {doc.description}
          </p>
        )}
      </div>
    </header>
  );
}
