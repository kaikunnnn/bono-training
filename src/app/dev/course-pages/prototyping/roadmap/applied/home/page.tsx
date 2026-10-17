/**
 * /dev/course-pages/prototyping/roadmap/applied/home — 課金ユーザーのトップ（ホーム）（#243 トピック2）
 *
 * トップを会員のホームにする案。最初の画面は「続きから」、その下に進行中、さらに下にサイトの更新情報。
 * 未ログインの人向けのおすすめ系ブロック（ヒーローの入会訴求・目的から探す・おすすめシリーズ・
 * トレーニング・キャリア・読みもの・レッスン紹介・みんなの実績）は出さない。
 * 本番の NewTopContent は書き換えず、使う部品（NewContentSection 等）だけをここで組む。
 * クリック計測（surface）は渡さない（#232 のデータに混ぜない）。
 *
 * 状態（確認用バーで切り替え）: ?state=new | progress（既定）| done
 * - new: まだ何も始めていない会員 →「最初の1コース」と「このコースを始める」
 * - progress: コースの途中 →「続きから」カード（ContinueCourseCard）＋ 本番の「進行中」
 * - done: コースを終えた直後 → 修了と、ロードマップ上の次のコース
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconCheck } from "@/components/ui/icon-check";
import { Button } from "@/components/ui/button";
import { NewContentSection } from "@/components/top-next/organisms/NewContentSection";
import { EventListRow } from "@/components/event/EventListRow";
import { ProgressPreview } from "@/app/mypage/sections/ProgressSectionClient";
import { getAllEvents, getLatestMixedContent } from "@/lib/sanity";
import { getQuestionList } from "@/lib/services/questions";
import {
  formatDaysUntil,
  formatEventStartTime,
  getDaysUntilEvent,
  getEventDateParts,
  groupEventsByStatus,
  toEventScheduleInput,
} from "@/lib/events/event-schedule";
import { cn } from "@/lib/utils";
import { getCourse, lessonSlugs } from "../../../../data";
import { ROADMAP_BASE, getRoadmap } from "../../../../data/roadmaps";
import { fetchLessons } from "../../../../data/sanity-lessons";
import type { Course, Field, LessonMap } from "../../../../data/types";
import CourseEyecatch, { pickCovers } from "../../../../template/CourseEyecatch";
import { KariProvider, T } from "../../../../template/kari";
import { splitTitle } from "../../../../template/shared";
import { ContinueCourseCard } from "../../ContinueCourseCard";
import { COURSE_V2, fetchContinueMock, roadmapLine } from "../../continue-data";
import { MiniPath } from "../../parts";

export const metadata: Metadata = {
  title: "課金ユーザーのトップ（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

type State = "new" | "progress" | "done";
type SearchParams = Promise<{ state?: string }>;

const k = (text: string): Field => ({ text, kari: true });

const STATES: { value: State; label: string }[] = [
  { value: "new", label: "まだ始めていない" },
  { value: "progress", label: "コースの途中" },
  { value: "done", label: "コースを終えた直後" },
];

const HOME = `${ROADMAP_BASE}/applied/home`;

/** トップの各セクションと同じ外枠（NewContentSection に合わせる） */
const SHELL = "px-6 lg:px-12";
const SECTION_H2 = "font-rounded-mplus text-[22px] font-medium leading-[1.71] text-text-primary";
const VIEW_ALL =
  "shrink-0 font-noto-sans-jp text-sm text-text-link underline-offset-4 hover:text-text-link-hover hover:underline";

function UpdateSection({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className={SHELL}>
      <div className="border-b border-black/[0.12] py-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className={SECTION_H2}>{title}</h2>
          <Link href={viewAllHref} className={VIEW_ALL}>
            一覧を見る →
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

/** 「このコースを始める」カード（new: 最初の1コース / done: 次のコース） */
function StartCourseCard({ course, lessons, reason }: { course: Course; lessons: LessonMap; reason?: Field }) {
  const t = splitTitle(course.title.text);
  return (
    <Link
      href={`${COURSE_V2}/${course.slug}?started=0`}
      className="group flex w-full flex-col gap-4 rounded-[20px] border border-border-light bg-surface p-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] sm:flex-row sm:items-center md:p-5"
    >
      <span className="w-full shrink-0 sm:w-[168px]">
        <CourseEyecatch covers={pickCovers(course, lessons)} label="" sizes="40px" className="rounded-[14px]" plannedLabel="近日公開" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[17px] font-bold leading-[1.5] text-text-primary">{t.main}</span>
        {t.sub ? <span className="block text-xs font-bold text-text-secondary">{t.sub}</span> : null}
        {reason ? (
          <span className="mt-2 block text-[13px] leading-[1.8] text-text-secondary">
            <T f={reason} />
          </span>
        ) : null}
      </span>
      <Button asChild className="w-full shrink-0 sm:w-auto">
        <span>
          このコースを始める
          <ArrowRight aria-hidden />
        </span>
      </Button>
    </Link>
  );
}

const SUB_LINK = "inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary hover:underline";

/** 最初の画面（状態ごと） */
async function FirstView({ state }: { state: State }) {
  if (state === "new") {
    const first = getCourse("ui-design-first")!;
    const lessons = await fetchLessons(lessonSlugs(first));
    return (
      <section aria-labelledby="home-first" className="flex flex-col gap-3">
        <h2 id="home-first" className={SECTION_H2}>
          最初の1コース
        </h2>
        <p className="text-sm text-text-secondary">
          <T f={k("Figmaを触ったことがなくても、ここから始められます。")} />
        </p>
        <StartCourseCard course={first} lessons={lessons} />
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/dev/course-pages" className={SUB_LINK}>
            ほかのコースから選ぶ
            <ArrowRight size={12} aria-hidden />
          </Link>
          <Link href={`${ROADMAP_BASE}/list`} className={SUB_LINK}>
            迷ったら目的から選ぶ（ロードマップ）
            <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
      </section>
    );
  }

  if (state === "done") {
    const done = getCourse("ui-design-visual")!;
    const nextCourse = getCourse(done.v2?.nextCourse.slug ?? "ui-experience")!;
    const lessons = await fetchLessons(lessonSlugs(nextCourse));
    const career = getRoadmap("career-change")!;
    const rm = roadmapLine(2);
    return (
      <section aria-labelledby="home-done" className="flex flex-col gap-3">
        <h2 id="home-done" className={SECTION_H2}>
          次のコース
        </h2>
        {/* 親: 終えたコースと、行き先のどこまで来たか（白にしない） */}
        <div className="rounded-[24px] bg-muted-custom p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <IconCheck isCompleted className="size-5" />
            {splitTitle(done.title.text).main}を修了しました
          </div>
          <MiniPath roadmap={career} done={2} className="mt-4 max-w-[480px]" />
          <Link href={rm.href} className={cn(SUB_LINK, "mt-3")}>
            {rm.label} <strong className="text-text-primary">いまここ {rm.done + 1}/{rm.total}</strong>
            <ArrowRight size={12} aria-hidden />
          </Link>
          {/* 主: 次の1コース */}
          <div className="mt-4">
            <StartCourseCard course={nextCourse} lessons={lessons} reason={done.v2?.nextCourse.reason} />
          </div>
        </div>
      </section>
    );
  }

  const { card } = await fetchContinueMock();
  return (
    <section aria-labelledby="home-continue" className="flex flex-col gap-3">
      <h2 id="home-continue" className={SECTION_H2}>
        続きから
      </h2>
      <ContinueCourseCard data={card} />
    </section>
  );
}

async function InProgress() {
  const { member } = await fetchContinueMock();
  return <ProgressPreview inProgressLessons={member.inProgress} />;
}

async function LatestContent() {
  const items = await getLatestMixedContent(4).catch(() => []);
  const articles = items.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
  }));
  return <NewContentSection articles={articles} viewAllHref="/updates" />;
}

async function Events() {
  const now = new Date();
  const events = await getAllEvents().catch(() => []);
  const { upcoming } = groupEventsByStatus(
    events.map((event) => ({ ...toEventScheduleInput(event), event })),
    now,
  );
  const rows = upcoming.slice(0, 3);
  return (
    <UpdateSection title="イベント" viewAllHref="/events">
      {rows.length > 0 ? (
        <div className="flex flex-col">
          {rows.map((item) => (
            <EventListRow
              key={item.event._id}
              href={`/events/${item.event.slug.current}`}
              title={item.event.title}
              thumbnailUrl={item.event.thumbnailUrl}
              dateParts={getEventDateParts(item)}
              dateTime={item.eventStartAt ?? undefined}
              startTimeLabel={formatEventStartTime(item)}
              daysUntilLabel={formatDaysUntil(getDaysUntilEvent(item, now))}
              upcoming
            />
          ))}
        </div>
      ) : (
        <p className="py-4 text-sm text-text-secondary">いま募集中のイベントはありません</p>
      )}
    </UpdateSection>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

async function Board() {
  const items = await getQuestionList({ limit: 3 }).catch(() => []);
  return (
    <UpdateSection title="掲示板の新着" viewAllHref="/questions">
      {items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map(({ question, commentCount, lastActivityAt }) => (
            <li key={question._id} className="border-b border-black/[0.06] last:border-b-0">
              <Link href={`/questions/${question.slug.current}`} className="group flex items-start gap-4 py-3">
                <span className="min-w-0 flex-1">
                  <h3 className="font-rounded-mplus text-sm font-medium leading-[24px] text-text-primary group-hover:underline">
                    {question.title}
                  </h3>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {question.category ? `${question.category.title}・` : ""}
                    {question.author?.displayName || "メンバー"}・コメント {commentCount}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5 text-xs text-text-muted">{formatDate(lastActivityAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-sm text-text-secondary">まだスレッドがありません</p>
      )}
    </UpdateSection>
  );
}

function SectionFallback({ title }: { title: string }) {
  return (
    <section className={SHELL}>
      <div className="border-b border-black/[0.12] py-8">
        <h2 className={SECTION_H2}>{title}</h2>
        <div className="mt-4 h-24 animate-pulse rounded-[12px] bg-muted-custom" aria-hidden="true" />
      </div>
    </section>
  );
}

export default async function AppliedHomePage({ searchParams }: { searchParams: SearchParams }) {
  const { state: raw } = await searchParams;
  const state: State = raw === "new" || raw === "done" ? raw : "progress";

  return (
    <KariProvider>
      {/* 確認用（本番のページには出ない） */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-dashed border-border-default bg-muted-custom px-6 py-2 font-noto-sans-jp text-xs text-text-secondary lg:px-12">
        <Link href={`${ROADMAP_BASE}/placement`} className="font-bold text-text-primary hover:underline">
          ← サイト内の見せ方
        </Link>
        <span>プロト：課金ユーザーのトップ（会員の状態はモック）</span>
        <span className="flex items-center gap-1.5">
          <span className="text-text-muted">状態</span>
          {STATES.map((s) => (
            <Link
              key={s.value}
              href={`${HOME}?state=${s.value}`}
              scroll={false}
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-bold",
                s.value === state
                  ? "border-text-primary bg-text-primary text-text-inverse"
                  : "border-border-light bg-surface text-text-secondary hover:border-border-default"
              )}
            >
              {s.label}
            </Link>
          ))}
        </span>
      </div>

      {/* 最初の画面: 続きから（状態で出し分け） */}
      <div className={cn(SHELL, "pt-8 md:pt-10")}>
        <div className="max-w-[880px] pb-10">
          <h1 className="mb-6 font-rounded-mplus text-2xl font-semibold leading-[1.4] text-text-primary">
            <T f={k(state === "new" ? "ようこそ" : "おかえりなさい")} />
          </h1>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-[24px] bg-muted-custom" aria-hidden="true" />}>
            <FirstView state={state} />
          </Suspense>
        </div>
      </div>

      {/* 進行中（本番マイページのセクション・中身はモック） */}
      {state === "progress" ? (
        <div className={SHELL}>
          <div className="max-w-[880px]">
            <Suspense fallback={null}>
              <InProgress />
            </Suspense>
          </div>
        </div>
      ) : null}

      {/* サイトの更新情報 */}
      <Suspense fallback={<NewContentSection articles={[]} viewAllHref="/updates" loading />}>
        <LatestContent />
      </Suspense>
      <Suspense fallback={<SectionFallback title="イベント" />}>
        <Events />
      </Suspense>
      <Suspense fallback={<SectionFallback title="掲示板の新着" />}>
        <Board />
      </Suspense>
      <div className="h-24" aria-hidden="true" />
    </KariProvider>
  );
}
