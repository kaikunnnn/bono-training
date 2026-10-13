/**
 * テンプレート＝全コース共通: つくった人 — #241
 * PersonaLessonTopClient の author 表示を寄せたもの。
 */

import Image from "next/image";
import type { Course } from "../data/types";
import { T } from "./kari";
import { SectionHead } from "./shared";

export default function CourseAuthor({ course }: { course: Course }) {
  const { author } = course;
  return (
    <section
      aria-labelledby="course-author"
      className="grid gap-8 border-t border-border-light py-16 md:grid-cols-[280px_minmax(0,1fr)] md:py-20"
    >
      <SectionHead id="course-author" kicker="Author" title="つくった人" />
      <div className="flex gap-5">
        <Image
          src={author.image}
          alt={author.name.text}
          width={80}
          height={80}
          loading="eager"
          className="size-20 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-bold leading-[1.5] text-text-primary">
            <T f={author.name} />
          </h3>
          <p className="mt-0.5 text-xs text-text-muted">
            <T f={author.role} />
          </p>
          <p className="mt-3 max-w-[560px] text-sm leading-[1.9] text-text-secondary">
            <T f={author.bio} />
          </p>
        </div>
      </div>
    </section>
  );
}
