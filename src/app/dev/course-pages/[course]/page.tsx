/**
 * /dev/course-pages/[course] — コース詳細のプロトタイプ（#241）
 *
 * 確認用: ?progress=1（進行中の会員の見え方・進捗はモック）、?curriculum=syllabus|syllabus-large|list（既定 syllabus）
 * ここはつなぎ役だけ: data（Course）を slug で引き、Sanity からレッスンの実データを取り、
 * template の CourseTemplate に渡す。見た目は template/、中身は data/。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, lessonSlugs, progressMocks } from "../data";
import { fetchLessons } from "../data/sanity-lessons";
import CourseTemplate from "../template/CourseTemplate";

type Params = Promise<{ course: string }>;
type SearchParams = Promise<{ progress?: string; curriculum?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  return {
    title: course ? `${course.title.text}（プロト）` : "コース（プロト）",
    robots: { index: false, follow: false },
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { course: slug } = await params;
  const { progress, curriculum } = await searchParams;
  const course = getCourse(slug);
  if (!course) notFound();

  const lessons = await fetchLessons(lessonSlugs(course));
  return (
    <CourseTemplate
      course={course}
      lessons={lessons}
      progressMock={progress === "1" ? (progressMocks[course.slug] ?? null) : null}
      curriculum={curriculum === "list" || curriculum === "syllabus-large" ? curriculum : "syllabus"}
    />
  );
}
