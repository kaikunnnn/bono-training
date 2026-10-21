import type { Metadata } from "next";
import React from "react";
import WorkshopHeader from "@/components/workshop/WorkshopHeader";
import StepSection from "@/components/workshop/StepSection";
import NumberChallengeHero from "@/components/number-challenge/NumberChallengeHero";
import { getStepsWithDocs } from "@/lib/number-challenge/content";
import {
  NUMBER_CHALLENGE_BASE_PATH,
  NUMBER_CHALLENGE_META,
} from "@/lib/number-challenge/config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: NUMBER_CHALLENGE_META.title,
  description: NUMBER_CHALLENGE_META.description,
  robots: { index: false }, // テスト運用中のため noindex（/docs/workshop と同じ扱い）
};

export default function NumberChallengeTopPage() {
  const steps = getStepsWithDocs();

  return (
    <main className="min-h-screen bg-surface">
      <WorkshopHeader questionUrl={null} />
      <div className="max-w-[1080px] mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24">
        <NumberChallengeHero />

        <div className="mt-16 md:mt-20">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              {i > 0 && (
                // ステップをつなぐ点線の縦棒
                <div
                  className="my-5 ml-1 h-12 md:h-14 border-l-2 border-dotted border-border-default"
                  aria-hidden
                />
              )}
              <StepSection step={step} basePath={NUMBER_CHALLENGE_BASE_PATH} />
            </React.Fragment>
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-border-light text-center text-[12px] font-line-seed-jp tracking-[0.2em] uppercase text-text-muted">
          BONO — {NUMBER_CHALLENGE_META.title}
        </footer>
      </div>
    </main>
  );
}
