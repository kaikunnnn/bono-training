import DocCard from "./DocCard";
import type { WorkshopStepWithDocs } from "@/lib/workshop/content";

interface StepSectionProps {
  step: WorkshopStepWithDocs;
}

/**
 * トップページ ブロック2：ステップ見出し + ドキュメントカード一覧
 * 淡い背景のブロックの中に白カードを置く構成
 */
export default function StepSection({ step }: StepSectionProps) {
  return (
    <section className="bg-base rounded-[20px] px-5 py-6 md:px-8 md:py-8">
      <div className="mb-5 md:mb-6">
        {step.label && (
          <p className="text-[12px] font-bold tracking-[0.18em] uppercase text-text-muted mb-2 font-hind">
            {step.label}
          </p>
        )}
        <h2 className="text-[20px] md:text-[22px] font-bold leading-[1.5] tracking-[-0.01em] text-text-primary font-rounded-mplus">
          {step.title}
        </h2>
        {step.description && (
          <p className="mt-2 text-[14px] leading-[1.9] text-text-secondary font-noto-sans-jp">
            {step.description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {step.docs.map((doc) => (
          <DocCard key={doc.slug} doc={doc} />
        ))}
      </div>
    </section>
  );
}
