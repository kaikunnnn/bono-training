/**
 * パターンE：ヒーロー直下に「何が身につくか」（#282, H3）
 * 文言は 279-E の冒頭の答え（「UIの基礎→情報設計→UXデザイン→ポートフォリオの順に、
 * 6つのステップで進みます。期間の目安は約1年。」）から。言い換えは足さない。
 */

import { Check } from "lucide-react";

const ITEMS = ["UIの基礎", "情報設計", "UXデザイン", "ポートフォリオ"] as const;

export default function WhatYouLearn({ stepCount = 6 }: { stepCount?: number }) {
  return (
    <section id="what-you-learn" className="px-4 pt-4 md:px-8">
      <div className="mx-auto max-w-[538px] rounded-[20px] border border-border-light bg-white p-5">
        <h2 className="text-[16px] font-bold leading-[24px] text-text-primary">何が身につくか</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {ITEMS.map((item, i) => (
            <li key={item} className="flex items-center gap-2 text-[15px] leading-[22px] text-text-primary">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cta-primary-bg text-text-inverse">
                <Check aria-hidden="true" className="size-3" strokeWidth={3} />
              </span>
              <span className="sr-only">{i + 1}. </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[14px] leading-[22px] text-text-secondary">
          UIの基礎→情報設計→UXデザイン→ポートフォリオの順に、{stepCount}つのステップで進みます。期間の目安は約1年。
        </p>
      </div>
    </section>
  );
}
