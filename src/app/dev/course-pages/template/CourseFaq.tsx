/**
 * テンプレート＝全コース共通: よくある質問 — #241
 * <details> で開閉（JS 不要）。
 */

import { Plus } from "lucide-react";
import type { Course } from "../data/types";
import { T } from "./kari";
import { SectionHead } from "./shared";

export default function CourseFaq({ course }: { course: Course }) {
  return (
    <section
      aria-labelledby="course-faq"
      className="grid gap-8 border-t border-border-light py-16 md:grid-cols-[280px_minmax(0,1fr)] md:py-20"
    >
      <SectionHead id="course-faq" kicker="FAQ" title="よくある質問" />
      <div className="border-t border-text-secondary">
        {course.faq.map((item, index) => (
          <details key={index} className="group border-b border-border-light" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <span className="font-latin text-sm font-bold text-text-muted">Q</span>
              <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-[1.6] text-text-primary">
                <T f={item.question} />
              </h3>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-light text-text-secondary transition-transform group-open:rotate-45">
                <Plus size={14} strokeWidth={2} />
              </span>
            </summary>
            <p className="pb-6 pl-7 pr-11 text-sm leading-[1.9] text-text-secondary">
              <T f={item.answer} />
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
