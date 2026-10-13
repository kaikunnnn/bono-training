/**
 * テンプレート＝全コース共通: コース詳細ページの組み立て — #241
 *
 * data（Course＋Sanity のレッスン）を受け取り、セクションを読む人の判断の順に並べるだけ。
 * ここから下（template/）は @/lib/sanity や data/index を読まない。中身は全部 props で受け取る。
 *
 * 順番: ヒーロー → 目指す状態 → コースの流れ → カリキュラム → 制作するもの
 *       → こんな人向け → つくった人 → よくある質問 → 最後のCTA
 */

import type { Course, LessonMap, ProgressMock } from "../data/types";
import CourseAudience from "./CourseAudience";
import CourseAuthor from "./CourseAuthor";
import CourseChange from "./CourseChange";
import CourseCurriculum from "./CourseCurriculum";
import CourseCurriculumSyllabus from "./CourseCurriculumSyllabus";
import CourseFaq from "./CourseFaq";
import CourseFinalCta from "./CourseFinalCta";
import CourseFlow from "./CourseFlow";
import CourseHero from "./CourseHero";
import CourseOutput from "./CourseOutput";
import { KariProvider, type CurriculumVariant } from "./kari";
import { computeProgress } from "./progress";

export default function CourseTemplate({
  course,
  lessons,
  progressMock,
  curriculum,
}: {
  course: Course;
  lessons: LessonMap;
  /** 進行中の会員として見せるときの進捗（確認用 ?progress=1）。null は未ログイン・未課金の見え方 */
  progressMock: ProgressMock | null;
  /** カリキュラムの版（確認用 ?curriculum=syllabus|list。既定はシラバス（大）） */
  curriculum: CurriculumVariant;
}) {
  const progress = progressMock ? computeProgress(course, lessons, progressMock) : null;
  const firstLesson = course.steps
    .flatMap((step) => step.items)
    .find((item) => item.type === "lesson");
  const startHref = firstLesson && firstLesson.type === "lesson" ? `/lessons/${firstLesson.slug}` : null;

  return (
    <KariProvider preview={{ progress: Boolean(progressMock), curriculum }}>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1180px] px-4 md:px-10">
          <CourseHero course={course} lessons={lessons} startHref={startHref} progress={progress} />
          <CourseChange course={course} />
          <CourseFlow course={course} statuses={progress?.steps.map((st) => st.status)} />
          {curriculum === "list" ? (
            <CourseCurriculum course={course} lessons={lessons} progress={progress} />
          ) : (
            <CourseCurriculumSyllabus
              course={course}
              lessons={lessons}
              progress={progress}
              size={curriculum === "syllabus-large" ? "lg" : "md"}
            />
          )}
          <CourseOutput course={course} />
          <CourseAudience course={course} />
          <CourseAuthor course={course} />
          <CourseFaq course={course} />
          <CourseFinalCta course={course} startHref={startHref} />
        </div>
      </div>
    </KariProvider>
  );
}
