/**
 * テンプレート＝全コース共通: こんな人向け — #241
 */

import { Monitor, Profile, Routing2 } from "iconsax-react";
import type { Course } from "../data/types";
import { T } from "./kari";
import { SectionHead } from "./shared";

/** 3つの項目に順に当てるアイコン */
const ICONS = [Profile, Monitor, Routing2];

export default function CourseAudience({ course }: { course: Course }) {
  return (
    <section
      aria-labelledby="course-audience"
      className="border-t border-border-light py-16 md:py-20"
    >
      <SectionHead id="course-audience" kicker="For you" title="こんな人向け" />
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {course.audience.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <li
              key={index}
              className="rounded-[24px] border border-border-light bg-surface p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-muted-custom text-text-primary">
                <Icon size={20} color="currentColor" variant="Bulk" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold leading-[1.6] text-text-primary">
                <T f={item.title} />
              </h3>
              <p className="mt-2 text-[13px] leading-[1.85] text-text-secondary">
                <T f={item.body} />
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
