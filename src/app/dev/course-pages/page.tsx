/**
 * /dev/course-pages — コース一覧のプロトタイプ（#241）
 *
 * data/index.ts の courses をカードで並べる（4コースとも同じ形・クリック可）。
 * カードのサムネは詳細ページと同じ CourseEyecatch を使う。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { courses, lessonSlugs } from "./data";
import { fetchLessons } from "./data/sanity-lessons";
import CourseEyecatch, { pickCovers } from "./template/CourseEyecatch";
import { KariProvider, T } from "./template/kari";
import { courseCounts, splitTitle } from "./template/shared";

export const metadata: Metadata = {
  title: "コース一覧（プロト）",
  robots: { index: false, follow: false },
};

export default async function CourseListPage() {
  const list = Object.values(courses);
  const lessons = await fetchLessons(list.flatMap(lessonSlugs));

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-10 md:px-10 md:pt-14">
          <Link
            href="/dev/course-pages/prototyping"
            className="mb-6 inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            ← プロトタイピングに戻る
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Courses</p>
          <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
            コース
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-[1.9] text-text-secondary">
            なりたい状態ごとに、レッスンを順番に並べました。上から進めれば、何ができるようになるかがわかります。
          </p>

          <ul className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2">
            {list.map((course) => {
              const { main, sub } = splitTitle(course.title.text);
              const counts = courseCounts(course);
              return (
                <li key={course.slug}>
                  <Link href={`/dev/course-pages/${course.slug}`} className="group block">
                    <CourseEyecatch
                      covers={pickCovers(course, lessons)}
                      label={course.shortTitle.text}
                      meta={`${counts.lessons} lessons`}
                      sizes="(min-width: 768px) 120px, 23vw"
                      className="transition-shadow group-hover:shadow-[var(--shadow-md)]"
                    />
                    <div className="mt-5 px-1">
                      <h2 className="font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em]">
                        {main}
                        {sub ? (
                          <span className="mt-0.5 block text-[15px] text-text-secondary">{sub}</span>
                        ) : null}
                      </h2>
                      <dl className="mt-4 flex flex-col gap-1.5 text-[13px] leading-[1.7]">
                        {[
                          { label: "得られる変化", field: course.change },
                          { label: "期間", field: course.period },
                          { label: "制作物", field: course.deliverable },
                        ].map(({ label, field }) => (
                          <div key={label} className="flex gap-3">
                            <dt className="w-[84px] shrink-0 text-text-muted">{label}</dt>
                            <dd className="min-w-0 font-medium">
                              <T f={field} />
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-4 flex items-center gap-2 text-xs font-bold text-text-secondary">
                        ステップ {counts.goals}
                        {counts.hasChallenge ? "＋チャレンジ" : ""}・レッスン {counts.lessons}本
                        {counts.planned > 0 ? `（うち未制作 ${counts.planned}本）` : ""}
                        <ArrowRight size={14} className="ml-auto transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </Link>
                  <Link
                    href={`/dev/course-pages/v2/${course.slug}`}
                    className="mt-3 ml-1 inline-flex items-center gap-1 rounded-full border border-border-light bg-surface px-2.5 py-1 text-[11px] font-bold text-text-link hover:border-border-default"
                  >
                    v2（完成形）を見る →
                  </Link>
                </li>
              );
            })}

          </ul>
        </div>
      </div>
    </KariProvider>
  );
}
