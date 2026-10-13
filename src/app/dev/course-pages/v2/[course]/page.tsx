/**
 * /dev/course-pages/v2/[course] — 完成形（v2）のコース詳細（#242 問1の改善点を入れたもの）
 *
 * v1（/dev/course-pages/[course]）は残して比較できるようにしている。
 * v2 の項目（Course.v2）が入っているコースだけ表示する（4コースとも入っている）。
 * 確認用: ?progress=1（進行中の会員の見え方・進捗はモック）
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, lessonSlugs, progressMocks } from "../../data";
import { fetchLessons } from "../../data/sanity-lessons";
import CourseTemplateV2 from "../../template/v2/CourseTemplateV2";

type Params = Promise<{ course: string }>;
type SearchParams = Promise<{ progress?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  return {
    title: course ? `${course.title.text}（v2 プロト）` : "コース（v2 プロト）",
    robots: { index: false, follow: false },
  };
}

export default async function CourseDetailV2Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { course: slug } = await params;
  const { progress } = await searchParams;
  const course = getCourse(slug);
  if (!course || !course.v2) notFound();

  const lessons = await fetchLessons(lessonSlugs(course));
  return (
    <CourseTemplateV2
      course={course}
      lessons={lessons}
      progressMock={progress === "1" ? (progressMocks[course.slug] ?? null) : null}
      nextCourse={getCourse(course.v2.nextCourse.slug)}
    />
  );
}
