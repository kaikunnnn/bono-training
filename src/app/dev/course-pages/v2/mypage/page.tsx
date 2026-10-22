/**
 * /dev/course-pages/v2/mypage — マイページ上部の「続きから」のモック（#242 問1の改善点 7）
 *
 * 見た目は本番 /mypage（src/app/mypage/MyPageShell.tsx）のヘッダーとタブを参考にしている。
 * 一番上に「続きから：〈コース名〉／〈レッスン〉の記事N」とコースの進捗バー。押すと v2 のコース詳細（?progress=1）へ。
 * 進捗はモック（data/progress-mock.ts）。記事数は Sanity の実データ。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCourse, lessonSlugs, progressMocks } from "../../data";
import { fetchLessons } from "../../data/sanity-lessons";
import CourseEyecatch, { pickCovers } from "../../template/CourseEyecatch";
import { ProgressBar } from "../../template/path";
import { computeProgress } from "../../template/progress";
import { splitTitle } from "../../template/shared";

export const metadata: Metadata = {
  title: "マイページ（続きから・v2 プロト）",
  robots: { index: false, follow: false },
};

const TABS = ["すべて", "進捗", "お気に入り", "閲覧履歴"];

export default async function MypageMock() {
  const course = getCourse("ai-ui-design")!;
  const lessons = await fetchLessons(lessonSlugs(course));
  const progress = computeProgress(course, lessons, progressMocks[course.slug] ?? {});
  const { main } = splitTitle(course.title.text);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] font-noto-sans-jp">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <Link href="/dev/course-pages/prototyping" className="text-xs text-text-muted hover:text-text-primary">
          ← プロトタイピングに戻る
        </Link>
      </div>

      {/* ヘッダー（本番 MyPageShell に合わせる） */}
      <div className="mx-auto max-w-3xl px-4 pb-0 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold leading-6 text-text-primary">マイページ</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted-strong p-[3px]" aria-hidden="true">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={
                i === 0
                  ? "rounded-md bg-surface px-2 py-1.5 text-xs font-bold leading-3 text-text-primary shadow-[var(--shadow-xs)]"
                  : "px-2 py-1.5 text-xs font-bold leading-3 text-text-muted"
              }
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* 続きから（新しく一番上に置く） */}
        <section aria-labelledby="mypage-resume">
          <h2 id="mypage-resume" className="mb-3 font-heading text-base font-bold text-text-primary">
            続きから
          </h2>
          <Link
            href={`/dev/course-pages/v2/${course.slug}?progress=1`}
            className="group flex items-center gap-4 rounded-[20px] border border-border-light bg-surface p-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] md:gap-5 md:p-5"
          >
            <div className="hidden w-[168px] shrink-0 sm:block">
              <CourseEyecatch
                covers={pickCovers(course, lessons)}
                label=""
                sizes="40px"
                className="rounded-[14px]"
              />
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
                <span className="shrink-0 text-xs font-bold text-text-secondary">
                  {progress.percent}%・記事 {progress.articlesDone}/{progress.articlesTotal}
                </span>
              </div>
            </div>
            <ArrowRight size={20} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        {/* 以下は本番のセクションの位置だけ示すダミー */}
        {["進行中", "お気に入り", "閲覧履歴"].map((name) => (
          <section key={name} aria-label={name}>
            <h2 className="mb-3 font-heading text-base font-bold text-text-muted">{name}</h2>
            <div className="flex h-24 items-center justify-center rounded-[16px] border-2 border-dashed border-border-light text-xs text-text-muted">
              本番の「{name}」セクション（このモックでは省略）
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
