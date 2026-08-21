import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingDiff } from "./PricingDiff";

export const metadata: Metadata = {
  title: "料金ページ 違いの見せ方（D0/D1/D2）",
  robots: { index: false, follow: false },
};

export default function PricingDiffPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingDiff />
    </Suspense>
  );
}
