/**
 * テンプレート＝全コース共通: このコースで目指す状態（受ける前 → 受けた後）— #241
 * ロードマップ詳細の ChangingLandscape（課題 → 矢印 → 解決）を寄せたもの。
 */

import { ArrowRight } from "lucide-react";
import type { Course } from "../data/types";
import { T } from "./kari";
import { SectionHead } from "./shared";

export default function CourseChange({ course }: { course: Course }) {
  return (
    <section aria-labelledby="course-change" className="border-t border-border-light py-16 md:py-20">
      <SectionHead
        id="course-change"
        kicker="Goal"
        title="このコースで目指す状態"
        lead={
          <>
            <T f={course.change} />。進める前と後で、こう変わることを目指します。
          </>
        }
      />

      <div className="mt-10">
        <div className="hidden grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] px-7 pb-3 text-xs font-bold text-text-muted md:grid">
          <span>受ける前</span>
          <span />
          <span>受けた後</span>
        </div>
        <ul className="flex flex-col gap-3">
          {course.changeRows.map((row, index) => (
            <li
              key={index}
              className="grid gap-3 rounded-[20px] border border-border-light bg-surface px-6 py-5 md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] md:items-center md:gap-0 md:px-7"
            >
              <p className="text-sm leading-[1.8] text-text-muted md:pr-4">
                <span className="mr-2 text-xs font-bold md:hidden">受ける前</span>
                <T f={row.before} />
              </p>
              <span className="hidden justify-center text-text-disabled md:flex" aria-hidden="true">
                <ArrowRight size={22} strokeWidth={1.8} />
              </span>
              <p className="text-[15px] font-bold leading-[1.75] text-text-primary md:pl-4">
                <span className="mr-2 text-xs font-bold text-text-muted md:hidden">受けた後</span>
                <T f={row.after} />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
