import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingLab } from "./PricingLab";

export const metadata: Metadata = {
  title: "料金ページ 構造パターン検証ラボ",
  robots: { index: false, follow: false },
};

export default function PricingLabPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingLab />
    </Suspense>
  );
}
