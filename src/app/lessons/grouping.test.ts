import { describe, expect, it } from "vitest";
import type { Lesson } from "@/types/sanity";
import { PERSONA_LESSON_SLUG } from "@/lib/persona-lesson-top-config";
import { groupRecommendedLessons } from "./grouping";

const lesson = (id: string, title: string, slug: string): Lesson => ({
  _id: id,
  _type: "lesson",
  title,
  slug: { _type: "slug", current: slug },
});

describe("groupRecommendedLessons", () => {
  it("always includes the persona lesson in the UX recommendations by slug", () => {
    const personaLesson = lesson(
      "persona",
      "Sanityでタイトルを変更しても表示される",
      PERSONA_LESSON_SLUG
    );

    const groups = groupRecommendedLessons([
      lesson("existing", "UXデザインってなに？", "ux-design"),
      personaLesson,
    ]);

    expect(groups.ux[0]).toBe(personaLesson);
    expect(groups.ux).toContain(personaLesson);
  });

  it("does not duplicate a lesson that also matches a title pattern", () => {
    const personaLesson = lesson(
      "persona",
      "UXデザインってなに？ ペルソナ中心のUIデザイン",
      PERSONA_LESSON_SLUG
    );

    const groups = groupRecommendedLessons([personaLesson]);

    expect(groups.ux).toEqual([personaLesson]);
  });
});
