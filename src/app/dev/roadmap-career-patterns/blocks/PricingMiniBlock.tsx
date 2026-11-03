/**
 * パターンD：ヒーローから外した料金枠を、流れの直後に小さく置く（#282, H1・H3）
 * 試作なので料金ボタンの計測（pricing_cta_click / withPricingFrom）は呼ばない。
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingMiniBlock() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 rounded-[20px] border border-border-light bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-[12px] font-bold text-text-muted">料金</h2>
          <p className="flex items-end gap-0.5 leading-none text-text-primary">
            <span className="font-latin text-[20px] font-bold">5,800</span>
            <span className="text-[13px]">円〜/月</span>
          </p>
        </div>
        <Button asChild size="large" className="w-full sm:w-auto">
          <Link href="/subscription">メンバーになってはじめる</Link>
        </Button>
      </div>
    </section>
  );
}
