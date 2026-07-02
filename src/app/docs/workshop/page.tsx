import type { Metadata } from "next";
import React from "react";
import WorkshopHero from "@/components/workshop/WorkshopHero";
import StepSection from "@/components/workshop/StepSection";
import { getStepsWithDocs } from "@/lib/workshop/content";
import { WORKSHOP_META } from "@/lib/workshop/config";
import { WS_DARK } from "@/components/workshop/theme";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `${WORKSHOP_META.title} | BONO`,
  description: WORKSHOP_META.description,
  robots: { index: false }, // テスト運用中のため noindex
};

export default function WorkshopTopPage() {
  const steps = getStepsWithDocs();
  const docsCount = steps.reduce((sum, s) => sum + s.docs.length, 0);

  return (
    <main className="min-h-screen" style={{ backgroundColor: WS_DARK.bg }}>
      <div className="max-w-[1080px] mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24">
        <WorkshopHero stepsCount={steps.length} docsCount={docsCount} />

        <div className="mt-16 md:mt-20">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              {i > 0 && (
                // ステップをつなぐ点線の縦棒
                <div
                  className="my-5 ml-1 h-12 md:h-14 border-l-2 border-dotted"
                  style={{ borderColor: WS_DARK.dotted }}
                  aria-hidden
                />
              )}
              <StepSection step={step} />
            </React.Fragment>
          ))}
        </div>

        <footer
          className="mt-20 pt-8 text-center text-[12px] font-hind tracking-[0.2em] uppercase"
          style={{ borderTop: `1px solid ${WS_DARK.hairline}`, color: WS_DARK.muted }}
        >
          BONO — {WORKSHOP_META.title}
        </footer>
      </div>
    </main>
  );
}
