/**
 * /dev/course-pages/v2/[course] — 完成形（v2）のコース詳細（#242 問1の改善点を入れたもの）
 *
 * v1（/dev/course-pages/[course]）は残して比較できるようにしている。
 * v2 の項目（Course.v2）が入っているコースだけ表示する（4コースとも入っている）。
 * 確認用: ?progress=1（進行中の会員の見え方・進捗はモック）
 * ?started=0|1（#243 トピック4「進めるのはコース」のイメージ）
 * - 0: まだ始めていない →「このコースを始める」（押すと ?started=1 ＝ 進めているコースとして登録した想定）
 * - 1: 進めている →「進めているコース」の印と進み具合、ボタンは「続きから：次の記事」
 * ?hero=01|02|03|04（#241 Figma のヒーロー4パターン）。無し or v2 は前の形（v2 のヒーロー）。上の帯で切り替え
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, lessonSlugs, progressMocks } from "../../data";
import { fetchLessons } from "../../data/sanity-lessons";
import CourseTemplateV2 from "../../template/v2/CourseTemplateV2";
import { computeProgress } from "../../template/progress";
import { fetchNextArticle } from "../../prototyping/roadmap/continue-data";
import { HERO_VARIANTS, type HeroVariant } from "../../template/v2/HeroSwitch";

type Params = Promise<{ course: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** 今のクエリを残したまま、一部だけ差し替えたリンク */
function withQuery(
  path: string,
  query: Record<string, string | string[] | undefined>,
  patch: Record<string, string | null>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key in patch || value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) params.append(key, v);
  }
  for (const [key, value] of Object.entries(patch)) if (value !== null) params.set(key, value);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

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
  const query = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const progress = one(query.progress);
  const startedParam = one(query.started);
  const heroParam = one(query.hero);
  const hero: HeroVariant = HERO_VARIANTS.some((v) => v.id === heroParam) ? (heroParam as HeroVariant) : "v2";
  // ?started が無いときは今まで通り（null）
  const started = startedParam === "1" ? true : startedParam === "0" ? false : null;
  const course = getCourse(slug);
  if (!course || !course.v2) notFound();

  const lessons = await fetchLessons(lessonSlugs(course));
  const progressMock =
    started === true || (started === null && progress === "1") ? (progressMocks[course.slug] ?? null) : null;

  // 進めているとき: 続きからの記事タイトル（Sanity の実データ）
  let resumeArticleTitle: string | null = null;
  if (started === true && progressMock) {
    const resume = computeProgress(course, lessons, progressMock).resume;
    if (resume) {
      const { next } = await fetchNextArticle(resume.slug, resume.articleNumber - 1);
      resumeArticleTitle = next?.articleTitle ?? null;
    }
  }

  const path = `/dev/course-pages/v2/${course.slug}`;
  const heroHrefs = Object.fromEntries(
    HERO_VARIANTS.map((v) => [v.id, withQuery(path, query, { hero: v.id === "v2" ? null : v.id })])
  ) as Record<HeroVariant, string>;

  return (
    <CourseTemplateV2
      course={course}
      lessons={lessons}
      progressMock={progressMock}
      nextCourse={getCourse(course.v2.nextCourse.slug)}
      started={started}
      resumeArticleTitle={resumeArticleTitle}
      hero={hero}
      heroHrefs={heroHrefs}
      startedHref={withQuery(path, query, { started: "1" })}
    />
  );
}
