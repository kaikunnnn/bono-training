/**
 * /dev/course-pages/prototyping/roadmap/applied/course-complete — コース修了の画面に当てはめる（#243）
 *
 * placement の「04 コース修了の画面」を、v2 のコースページと同じ部品・見た目で組んだもの。
 * 本番にはコース修了の画面がまだないので、画面そのものが推測（仮）。
 * 基礎コースを修了した会員（行き先: 未経験から転職）が見る想定で、
 * 「いまここ 3/5（2つ完了）」と次の1コース（体験）を見せる。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icon-check";
import type { Field } from "../../../../data/types";
import { getCourse, lessonSlugs } from "../../../../data";
import { ROADMAP_BASE, getRoadmap } from "../../../../data/roadmaps";
import { fetchLessons } from "../../../../data/sanity-lessons";
import CourseEyecatch, { pickCovers } from "../../../../template/CourseEyecatch";
import { KariProvider, T } from "../../../../template/kari";
import { hereLabel } from "../../../../template/path";
import { splitTitle } from "../../../../template/shared";
import { MiniPath } from "../../parts";

export const metadata: Metadata = {
  title: "コース修了の画面（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

const k = (text: string): Field => ({ text, kari: true });

const CARD =
  "group block w-full rounded-[20px] border border-border-light bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]";

const LABEL = "font-heading text-[15px] font-bold leading-[1.5] text-text-primary";

export default async function AppliedCourseCompletePage() {
  const done = getCourse("ui-design-visual")!;
  const nextCourse = getCourse(done.v2?.nextCourse.slug ?? "ui-experience")!;
  const career = getRoadmap("career-change")!;
  const lessons = await fetchLessons([...lessonSlugs(done), ...lessonSlugs(nextCourse)]);
  const doneTitle = splitTitle(done.title.text);
  const next = splitTitle(nextCourse.title.text);
  const firstLesson = lessonSlugs(nextCourse)[0];
  // 基礎を修了 → はじめて・基礎の2つが完了、体験がいまここ
  const roadmapDone = 2;

  return (
    <KariProvider>
      {/* 確認用（本番のページには出ない） */}
      <div className="border-b border-dashed border-border-default bg-muted-custom px-6 py-2 font-noto-sans-jp text-xs text-text-secondary lg:px-12">
        <Link href={`${ROADMAP_BASE}/placement`} className="font-bold text-text-primary hover:underline">
          ← サイト内の見せ方
        </Link>
        <span className="ml-3">プロト：コース修了の画面（本番にはまだない画面・全体が仮）。基礎コースを修了した会員の見え方</span>
      </div>

      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-10 px-4 pb-28 pt-10 md:pt-14">
          {/* 修了 */}
          <header className="flex flex-col items-center text-center">
            <div className="w-full max-w-[320px]">
              <CourseEyecatch covers={pickCovers(done, lessons)} label="" sizes="80px" className="rounded-[20px]" />
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-text-secondary">
              <IconCheck isCompleted className="size-5" />
              コース修了
            </div>
            <h1 className="mt-2 font-heading text-[24px] font-bold leading-[1.5] tracking-[-0.03em] md:text-[28px]">
              {doneTitle.main}を修了しました
            </h1>
            <p className="mt-3 max-w-[480px] text-sm leading-[1.9] text-text-secondary">
              <T f={k("良いデザインを分解して学ぶ習慣と、見た目の6要素で画面を整える力が手元に残りました。")} />
            </p>
          </header>

          {/* ロードマップのどこまで来たか */}
          <section aria-labelledby="cc-roadmap" className="flex flex-col gap-3">
            <h2 id="cc-roadmap" className={LABEL}>
              ロードマップのどこまで来たか
            </h2>
            <Link href={`${ROADMAP_BASE}/${career.slug}?progress=1`} className={`${CARD} px-4 py-4 md:px-5`}>
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-xs font-bold text-text-muted">
                  あなたの行き先：<span className="text-text-primary">{career.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-text-primary">
                  {hereLabel(roadmapDone, career.stops.length)}
                  <ArrowRight size={14} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
              <MiniPath roadmap={career} done={roadmapDone} className="mt-4" />
            </Link>
          </section>

          {/* 次はこのコース */}
          <section aria-labelledby="cc-next" className="flex flex-col gap-3">
            <h2 id="cc-next" className={LABEL}>
              次はこのコース
            </h2>
            <Link href={`/dev/course-pages/v2/${nextCourse.slug}`} className={`${CARD} p-4 md:p-5`}>
              <span className="flex items-center gap-4">
                <span className="hidden w-[140px] shrink-0 sm:block">
                  <CourseEyecatch
                    covers={pickCovers(nextCourse, lessons)}
                    label=""
                    sizes="36px"
                    className="rounded-[14px]"
                    plannedLabel="近日公開"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[17px] font-bold leading-[1.5]">{next.main}</span>
                  {next.sub ? <span className="block text-xs font-bold text-text-secondary">{next.sub}</span> : null}
                </span>
                <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </span>
              {done.v2 ? (
                <span className="mt-3 block text-[13px] leading-[1.8] text-text-secondary">
                  <T f={done.v2.nextCourse.reason} />
                </span>
              ) : null}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {firstLesson ? (
                <Button size="lg" asChild>
                  <Link href={`/lessons/${firstLesson}`}>
                    体験コースをはじめる
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : null}
              <Button variant="ghost" size="lg" asChild>
                <Link href={`${ROADMAP_BASE}/applied/mypage`}>マイページに戻る</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </KariProvider>
  );
}
