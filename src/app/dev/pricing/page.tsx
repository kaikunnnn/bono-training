import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingPageClient } from "./PricingPageClient";

export const metadata: Metadata = {
  title: "料金プラン（本番プロト）",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingPageClient />
    </Suspense>
  );
}
