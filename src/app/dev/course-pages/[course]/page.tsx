/**
 * /dev/course-pages/[course] — コース詳細のプロトタイプ（#241）
 *
 * ここはつなぎ役だけ: data（Course）を slug で引き、Sanity からレッスンの実データを取り、
 * template の CourseTemplate に渡す。見た目は template/、中身は data/。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, lessonSlugs } from "../data";
import { fetchLessons } from "../data/sanity-lessons";
import CourseTemplate from "../template/CourseTemplate";

type Params = Promise<{ course: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  return {
    title: course ? `${course.title.text}（プロト）` : "コース（プロト）",
    robots: { index: false, follow: false },
  };
}

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const lessons = await fetchLessons(lessonSlugs(course));
  return <CourseTemplate course={course} lessons={lessons} />;
}
