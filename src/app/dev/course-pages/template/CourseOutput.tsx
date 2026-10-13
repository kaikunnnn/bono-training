/**
 * テンプレート＝全コース共通: 制作するもの（最終お題）— #241
 * 左に制作物（Figma 原文）と中身、右に完成イメージの枠（画像はまだ無いので枠だけ）。
 */

import { Check } from "lucide-react";
import type { Course } from "../data/types";
import { T } from "./kari";
import { EYECATCH_BG, SectionHead } from "./shared";

export default function CourseOutput({ course }: { course: Course }) {
  return (
    <section aria-labelledby="course-output" className="border-t border-border-light py-16 md:py-20">
      <SectionHead id="course-output" kicker="Output" title="制作するもの" />

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <p className="font-heading text-xl font-bold leading-[1.6] text-text-primary md:text-2xl">
            <T f={course.deliverable} />
          </p>
          <p className="mt-4 text-[15px] leading-[1.9] text-text-secondary">
            <T f={course.output.lead} />
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {course.output.points.map((point, index) => (
              <li key={index} className="flex gap-3 text-sm leading-[1.8] text-text-primary">
                <span className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-custom">
                  <Check size={12} strokeWidth={3} className="text-text-success" />
                </span>
                <span>
                  <T f={point} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 完成イメージの枠（ブラウザ風） */}
        <div className={`overflow-hidden rounded-[32px] p-5 md:p-8 ${EYECATCH_BG}`}>
          <div className="overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-lift)]">
            <div className="flex items-center gap-1.5 border-b border-border-light px-4 py-2.5">
              <span className="size-2 rounded-full bg-border-light" />
              <span className="size-2 rounded-full bg-border-light" />
              <span className="size-2 rounded-full bg-border-light" />
              <span className="ml-3 h-4 flex-1 rounded bg-muted-custom" />
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {["Hover", "Accordion", "Modal"].map((name) => (
                <div key={name} className="flex aspect-[4/3] flex-col justify-end rounded-[10px] bg-muted-custom p-2">
                  <span className="font-mono text-[10px] text-text-muted">{name}</span>
                </div>
              ))}
              <div className="col-span-3 h-3 w-2/3 rounded bg-muted-custom" />
              <div className="col-span-3 h-3 w-1/2 rounded bg-muted-custom" />
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-text-secondary">完成イメージ（画像は準備中）</p>
        </div>
      </div>
    </section>
  );
}
