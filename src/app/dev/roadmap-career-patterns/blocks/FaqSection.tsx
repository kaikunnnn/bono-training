/**
 * パターンI：よくある質問をカリキュラムの前に（#282, H2・H3）
 *
 * 文言の出典（issue 282「試作の作り方」）:
 * - 何から勉強すればいい？ … Sanity のロードマップ steps[0]・steps[1] の見出しをそのまま
 * - 働きながらでも進められる？ … 今のページ（変化セクション）の文をそのまま（Sanity から取る）
 * - デザインの経験があると早く進められる？ … オーナーの言葉。文言未確定なので仮札
 * - 資格の質問は出典が無いので載せない
 * 開閉は details/summary（JS不要）。質問は h3。
 */

import { ChevronDown } from "lucide-react";
import { ProvisionalTag } from "../parts";

export interface FaqItem {
  question: string;
  answer: string;
  provisional?: string;
}

export default function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-6">
          <div className="mb-4 inline-flex items-center justify-center rounded-full border border-text-secondary px-[8px] py-[2px]">
            <span className="text-[12px] font-bold text-text-secondary">Q&amp;A</span>
          </div>
          <h2 className="text-[24px] font-extrabold leading-[36px] text-text-secondary">よくある質問</h2>
        </div>

        <div className="rounded-[20px] border border-border-light bg-white px-5">
          {items.map((item, i) => (
            <details
              key={item.question}
              className="group border-b border-border-light last:border-b-0"
              open={i === 0}
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[16px] font-bold leading-[24px] text-text-primary">{item.question}</h3>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <div className="pb-4">
                <p className="text-[15px] leading-[24px] text-text-primary">{item.answer}</p>
                {item.provisional && (
                  <p className="mt-2">
                    <ProvisionalTag>{item.provisional}</ProvisionalTag>
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
