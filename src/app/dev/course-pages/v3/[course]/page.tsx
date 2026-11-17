/**
 * /dev/course-pages/v3/[course] — 個別ロードマップ4本をコースに置き換えたコースページ（#300）
 *
 * 見た目は v2 のテンプレート（CourseTemplateV2・シラバス大）をそのまま使う。ヒーローは hero-patterns の 01（左右分割）が既定。
 * 中身は data/v3/（章＝今のロードマップのステップ、レッスンと順番は同じ）。
 * 確認用（画面下のバー）:
 * - ?name=a|b … 名前の2案（a: 検索の言葉が主役 / b: 対象を名前で名指し）。タイトル・サブ行・こんな人向け・得られる変化・向いていない人が変わる
 * - ?state=guest|member … 未課金 / 課金後（進捗はモック。課金後は「進めているコース」と「続きから」）
 * - ?hero=01|02|03|04 … ヒーローの版（既定 01。v2 の「前の形」は v1 へのリンクを持つので v3 では出さない）
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseV3, getCourseV3Entry, lessonSlugsV3, parseName, progressMocksV3, resolveCourse, V3_BASE } from "../../data/v3";
import { fetchLessons } from "../../data/sanity-lessons";
import CourseTemplateV2 from "../../template/v2/CourseTemplateV2";
import { computeProgress } from "../../template/progress";
import { fetchNextArticle } from "../../prototyping/roadmap/continue-data";
import { heroSegment, parseHero, nameSegment, parseState, stateSegment } from "../switches";

type Params = Promise<{ course: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { course: slug } = await params;
  const name = parseName(one((await searchParams).name));
  const entry = getCourseV3Entry(slug);
  return {
    title: entry ? `${entry.names[name].title.text}（v3 プロト）` : "コース（v3 プロト）",
    robots: { index: false, follow: false },
  };
}

export default async function CourseDetailV3Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { course: slug } = await params;
  const query = await searchParams;
  const name = parseName(one(query.name));
  const state = parseState(one(query.state));
  const hero = parseHero(one(query.hero));

  const entry = getCourseV3Entry(slug);
  if (!entry) notFound();
  const course = resolveCourse(entry, name);

  const lessons = await fetchLessons(lessonSlugsV3(course));
  const member = state === "member";
  const progressMock = member ? (progressMocksV3[course.slug] ?? {}) : null;

  // 課金後: 続きからの記事タイトル（Sanity の実データ）
  let resumeArticleTitle: string | null = null;
  if (progressMock) {
    const resume = computeProgress(course, lessons, progressMock).resume;
    if (resume) {
      const { next } = await fetchNextArticle(resume.slug, resume.articleNumber - 1);
      resumeArticleTitle = next?.articleTitle ?? null;
    }
  }

  const nextSlug = course.v2!.nextCourse.slug;
  const nextCourse = nextSlug ? getCourseV3(nextSlug, name) : null;
  const keep = new URLSearchParams();
  if (name !== "a") keep.set("name", name);
  if (member) keep.set("state", "member");
  const qs = keep.toString();

  return (
    <CourseTemplateV2
      course={course}
      lessons={lessons}
      progressMock={progressMock}
      nextCourse={nextCourse}
      started={member ? true : null}
      resumeArticleTitle={resumeArticleTitle}
      hero={hero}
      nextCourseHref={nextCourse ? `${V3_BASE}/${nextCourse.slug}${qs ? `?${qs}` : ""}` : undefined}
      switches={[nameSegment(name), stateSegment(state), heroSegment(hero)]}
    />
  );
}
