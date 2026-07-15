import DocCard from "./DocCard";
import type { WorkshopStepWithDocs } from "@/lib/workshop/content";
import { WS_THEME } from "./theme";

interface StepSectionProps {
  step: WorkshopStepWithDocs;
}

/**
 * トップページ ブロック2（ダークエディトリアル版）
 * ステップ見出し + 白いクリッカブルカード。左端はヒーローと同じラインに揃える
 */
export default function StepSection({ step }: StepSectionProps) {
  return (
    <section>
      <div className="mb-5 md:mb-6">
        {step.label && (
          <p
            className="text-[11px] md:text-[12px] font-semibold tracking-[0.28em] uppercase mb-2.5 font-line-seed-jp"
            style={{ color: WS_THEME.muted }}
          >
            {step.label}
          </p>
        )}
        <h2
          className="font-line-seed-jp font-bold text-[24px] md:text-[28px] leading-[1.4] tracking-[-0.01em]"
          style={{ color: WS_THEME.ink }}
        >
          {step.title}
        </h2>
        {step.description && (
          <p
            className="mt-2 text-[13px] md:text-[14px] leading-[1.9] font-line-seed-jp"
            style={{ color: WS_THEME.body }}
          >
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
