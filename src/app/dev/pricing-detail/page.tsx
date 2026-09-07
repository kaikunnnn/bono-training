import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingDetail } from "./PricingDetail";

export const metadata: Metadata = {
  title: "料金ページ プラン説明の簡潔化（E1/E2）",
  robots: { index: false, follow: false },
};

export default function PricingDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingDetail />
    </Suspense>
  );
}
