import type { Metadata } from "next";
import WorkshopHero from "@/components/workshop/WorkshopHero";
import StepSection from "@/components/workshop/StepSection";
import { getStepsWithDocs } from "@/lib/workshop/content";
import { WORKSHOP_META } from "@/lib/workshop/config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `${WORKSHOP_META.title} | BONO`,
  description: WORKSHOP_META.description,
  robots: { index: false }, // テスト運用中のため noindex
};

export default function WorkshopTopPage() {
  const steps = getStepsWithDocs();

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-24">
        <WorkshopHero />

        <div className="mt-16 md:mt-20 flex flex-col gap-8 md:gap-10">
          {steps.map((step) => (
            <StepSection key={step.id} step={step} />
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-border-light text-center text-[12px] text-text-muted">
          BONO — {WORKSHOP_META.title}
        </footer>
      </div>
    </main>
  );
}
