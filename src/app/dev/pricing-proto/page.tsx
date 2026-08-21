import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingProto } from "./PricingProto";

export const metadata: Metadata = {
  title: "料金ページ 本番プロトタイプ",
  robots: { index: false, follow: false },
};

export default function PricingProtoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingProto />
    </Suspense>
  );
}
