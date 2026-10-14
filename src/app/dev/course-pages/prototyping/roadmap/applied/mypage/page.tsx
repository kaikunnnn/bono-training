/**
 * /dev/course-pages/prototyping/roadmap/applied/mypage — 実物のマイページに当てはめる（#243）
 *
 * placement の「03 マイページ：『いまここ』の小さな地図」を、本番のマイページ
 * （MyPageShell ＋ 進行中・お気に入り・閲覧履歴のセクションをそのまま）に当てはめた見た目。
 * 一番上に「続きから」（v2/mypage のカード）、そのすぐ下に行き先の「いまここ」を足す。
 * 会員の状態はモック（未経験から転職を選び、基礎コースの途中）。ログイン不要・DB書き込みなし。
 * - 進行中・閲覧履歴: 本番のセクションに Sanity の実レッスン・実記事を渡して描く
 * - お気に入り: 空の状態（本番の空表示）。★を押すと書き込みが起きるため、モックでは並べない
 * 推測の文言には「仮」タグ（下の確認用バーで表示）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MyPageShell } from "@/app/mypage/MyPageShell";
import { ProgressPreview } from "@/app/mypage/sections/ProgressSectionClient";
import { BookmarksPreview } from "@/app/mypage/sections/BookmarksSectionClient";
import { HistoryPreview } from "@/app/mypage/sections/HistorySectionClient";
import type { Field } from "../../../../data/types";
import { getCourse, lessonSlugs, progressMocks } from "../../../../data";
import { ROADMAP_BASE, getRoadmap } from "../../../../data/roadmaps";
import { fetchLessons } from "../../../../data/sanity-lessons";
import CourseEyecatch, { pickCovers } from "../../../../template/CourseEyecatch";
import { KariProvider, T } from "../../../../template/kari";
import { ProgressBar, hereLabel } from "../../../../template/path";
import { computeProgress } from "../../../../template/progress";
import { splitTitle } from "../../../../template/shared";
import { MiniPath } from "../../parts";
import { fetchMemberMock } from "./member-mock";

export const metadata: Metadata = {
  title: "マイページに当てはめる（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

const k = (text: string): Field => ({ text, kari: true });

/** 本番 MySection の見出しと同じ見た目 */
const SECTION_HEADING = "font-rounded-mplus text-base font-semibold leading-6 text-text-primary";

export default async function AppliedMypagePage() {
  const course = getCourse("ui-design-visual")!;
  const career = getRoadmap("career-change")!;
  const lessons = await fetchLessons(lessonSlugs(course));
  const progress = computeProgress(course, lessons, progressMocks[course.slug] ?? {});
  const { main } = splitTitle(course.title.text);
  // 進行中のレッスン（基礎の2本目、記事9まで完了）と閲覧履歴
  const resumeSlug = progress.resume?.slug ?? "ui-design-flow-lv1";
  const resumeDone = progress.lessons[resumeSlug]?.done ?? 0;
  const member = await fetchMemberMock(resumeSlug, resumeDone);
  // 行き先「未経験から転職」: はじめてを終え、基礎がいまここ
  const roadmapDone = 1;

  return (
    <KariProvider>
      {/* 確認用（本番のページには出ない） */}
      <div className="border-b border-dashed border-border-default bg-muted-custom px-6 py-2 font-noto-sans-jp text-xs text-text-secondary lg:px-12">
        <Link href={`${ROADMAP_BASE}/placement`} className="font-bold text-text-primary hover:underline">
          ← サイト内の見せ方
        </Link>
        <span className="ml-3">
          プロト：本番のマイページに「続きから」と「いまここ」を足した見た目（会員の状態はモック・タブは本番へ移動）
        </span>
      </div>

      <MyPageShell activeTab="all">
        {/* 続きから ＋ いまここ（新しく一番上に置く） */}
        <section
          aria-labelledby="mypage-resume"
          className="flex w-full flex-col items-start gap-3 border-b border-border-light pb-10"
        >
          <h2 id="mypage-resume" className={SECTION_HEADING}>
            続きから
          </h2>
          <Link
            href={`/dev/course-pages/v2/${course.slug}?progress=1`}
            className="group flex w-full items-center gap-4 rounded-[20px] border border-border-light bg-surface p-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] md:gap-5 md:p-5"
          >
            <div className="hidden w-[168px] shrink-0 sm:block">
              <CourseEyecatch covers={pickCovers(course, lessons)} label="" sizes="40px" className="rounded-[14px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-muted">{main}</p>
              <p className="mt-1 font-heading text-[17px] font-bold leading-[1.5] text-text-primary">
                {progress.resume
                  ? `${progress.resume.title}の記事${progress.resume.articleNumber}`
                  : "すべて完了しています"}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={progress.percent} className="h-1.5 flex-1" />
                <span className="shrink-0 text-xs font-bold text-text-secondary">{progress.percent}%</span>
              </div>
            </div>
            <ArrowRight size={20} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* いまここ（行き先を選んだ人だけ） */}
          <Link
            href={`${ROADMAP_BASE}/${career.slug}?progress=1`}
            className="group mt-1 block w-full rounded-[20px] border border-border-light bg-surface px-4 py-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] md:px-5"
          >
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
            <span className="mt-3 block text-xs leading-[1.8] text-text-secondary">
              <T f={k("基礎コースを終えると、次は体験コースで画面の流れをつくります。")} />
            </span>
          </Link>
        </section>

        {/* ここから下は本番のセクション（中身はモック） */}
        <ProgressPreview inProgressLessons={member.inProgress} />
        <BookmarksPreview bookmarks={[]} />
        <HistoryPreview viewHistory={member.history} />
      </MyPageShell>
    </KariProvider>
  );
}
