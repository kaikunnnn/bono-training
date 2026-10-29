/**
 * #267 新しいトップの試作 — 4つの入口より下のセクション（S3〜S5）と、会員の「続きから」の帯
 *
 * 並びは 267-L 6章（オーナー回答で 4=コース、5=転職の道のり に入れ替え）。
 * - ContinueBand: 会員だけ、ヒーローの上。データは course-pages の「続きから」モック（fetchContinueMock）
 * - TroubleBand / GuideBand: 参考サイトの「BEYOND THE JOB」の形（アイブロウ・見出し・右に一覧リンク・2列の行）
 * - CourseSection: course-card-patterns のトップ横並び版の形（サムネ → タイトル → 1行 → 期間・制作物）。
 *   データは course-pages/data の4コース、サムネは一覧と同じ CourseEyecatch
 * - CareerPathSection: v6 のステップ（文言は roadmap-career-change-v6.ts から引く）。番号札は RoadmapPathway の形
 * - SupportSection: フィードバック／掲示板／イベント
 * - Achievements: 本番 AchievementHighlightSection をそのまま（Sanity の実データ）
 * - MemberGuide: 未ログインだけ。メンバーの案内と BONOについて
 * 色はオレンジを使わない（オーナー指定）。アクセントは深い緑（cta-primary）と黒・グレー。
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Calendar2, MessageQuestion, Messages1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import { getAchievementGroups } from "@/lib/sanity";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";
import { cn } from "@/lib/utils";
import { courses, lessonSlugs } from "../../../course-pages/data";
import { fetchLessons } from "../../../course-pages/data/sanity-lessons";
import { v6Steps } from "../../../course-pages/data/roadmap-career-change-v6";
import type { Field } from "../../../course-pages/data/types";
import CourseEyecatch, { pickCovers } from "../../../course-pages/template/CourseEyecatch";
import { courseCounts, splitTitle } from "../../../course-pages/template/shared";
import { ProgressBar } from "../../../course-pages/template/path";
import { fetchContinueMock } from "../../../course-pages/prototyping/roadmap/continue-data";
import { Kari, V6_BASE, v6Step } from "../../_parts/shared";
import { COMING_BASE, withState } from "./top-parts";

/** 推測の文言（kari）なら「仮」を付けて出す */
function F({ f }: { f: Field }) {
  return (
    <>
      {f.text}
      {f.kari ? <Kari /> : null}
    </>
  );
}

// ------------------------------------------------------------
// 共通: セクションの見出し（アイブロウ・h2・右にリンク）
// ------------------------------------------------------------

function SectionHeader({
  eyebrow,
  title,
  titleKari,
  link,
}: {
  eyebrow: string;
  title: string;
  titleKari?: boolean;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-noto-sans-jp text-xs font-bold tracking-[0.16em] text-cta-primary-hover">{eyebrow}</p>
        <h2 className="mt-3 font-heading text-[28px] font-bold leading-[1.35] text-text-primary lg:text-[36px]">
          {title}
          {titleKari ? <Kari className="ml-2 align-middle" /> : null}
        </h2>
      </div>
      {link ? (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-1.5 font-noto-sans-jp text-sm font-bold text-text-primary hover:underline hover:underline-offset-4"
        >
          {link.label}
          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      ) : null}
    </div>
  );
}

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("px-6 py-16 lg:px-12 lg:py-24", className)}>{children}</section>;
}

// ------------------------------------------------------------
// 0 会員の「続きから」の帯（ヒーローの上）
// ------------------------------------------------------------

export async function ContinueBand() {
  const { card } = await fetchContinueMock();
  const { course, next } = card;
  return (
    <div className="px-6 pt-6 lg:px-12">
      {/* h1 より上なので見出しタグは使わない */}
      <div className="flex flex-col gap-4 rounded-[20px] bg-muted-custom px-5 py-4 md:flex-row md:items-center md:gap-8">
        <div className="min-w-0 md:w-[300px] md:shrink-0">
          <p className="text-[11px] font-bold text-text-muted">進めているコース</p>
          <p className="mt-0.5 truncate font-heading text-[15px] font-bold text-text-primary">{course.title}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <ProgressBar value={course.percent} className="h-1 flex-1" />
            <span className="shrink-0 text-[11px] text-text-secondary">
              レッスン {course.lessonsDone}/{course.lessonsTotal}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 md:border-l md:border-border-light md:pl-8">
          <p className="text-[11px] font-bold text-text-muted">次はこの記事</p>
          <p className="mt-0.5 truncate font-noto-sans-jp text-sm font-bold text-text-primary">
            {next ? next.articleTitle : "コースの目次から選ぶ"}
          </p>
          {next ? (
            <p className="mt-0.5 truncate text-[11px] text-text-muted">
              {next.lessonTitle}・記事{next.articleNumber}
            </p>
          ) : null}
        </div>
        <Button variant="primary" size="large" className="w-fit shrink-0" asChild>
          <Link href={next ? next.href : course.href}>
            続きから
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function ContinueBandSkeleton() {
  return (
    <div className="px-6 pt-6 lg:px-12" aria-hidden="true">
      <div className="h-[84px] animate-pulse rounded-[20px] bg-muted-custom motion-reduce:animate-none" />
    </div>
  );
}

// ------------------------------------------------------------
// 3・7 「〜したい」の行（2列）
// ------------------------------------------------------------

function RowList({ items, href }: { items: string[]; href: string }) {
  return (
    <ul className="mt-10 grid grid-cols-1 border-t border-black/[0.12] md:grid-cols-2 md:gap-x-12">
      {items.map((label) => (
        <li key={label} className="border-b border-black/[0.12]">
          <Link
            href={href}
            className="group -mx-3 flex items-center justify-between gap-4 rounded-[8px] px-3 py-5 transition-colors hover:bg-black/[0.03]"
          >
            <span className="font-noto-sans-jp text-[15px] font-medium leading-[1.6] text-text-primary lg:text-base">
              {label}
            </span>
            <ArrowUpRight
              size={18}
              aria-hidden="true"
              className="shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const TROUBLES = [
  "最初の1画面を作りたい",
  "お手本どおりに作れるようになりたい",
  "見た目の素人っぽさを直したい",
  "画面同士をつなげたい",
  "使いやすい画面にしたい",
  "何を解決するか決めたい",
  "作ったものに自信を持ちたい",
  "ポートフォリオに載せるものを決めたい",
  "面接でうまく話したい",
  "AIに頼り切りから抜けたい",
];

export function TroubleBand({ member }: { member: boolean }) {
  const href = withState(`${COMING_BASE}?what=troubles`, member);
  return (
    <Section>
      <SectionHeader
        eyebrow="BEYOND THE BASICS / つまずきから探す"
        title="つまずきも、ひとつずつ。"
        link={{ href, label: "悩みの一覧" }}
      />
      <RowList items={TROUBLES} href={href} />
    </Section>
  );
}

const GUIDE_WANTS = [
  "何から始めるか知りたい",
  "仕事と両立して続けたい",
  "独学の限界を越えたい",
  "作ったものを見てもらいたい",
  "転職の時期を決めたい",
  "年齢や経歴の不安を整理したい",
];

export function GuideBand() {
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="STUDY & CAREER / 学び方とキャリア"
        title="続け方も、これからのことも。"
        titleKari
        link={{ href: "/guide", label: "勉強法・キャリア" }}
      />
      <RowList items={GUIDE_WANTS} href="/guide" />
      <p className="mt-4 text-xs text-text-muted">
        項目の文言は仮
        <Kari />
      </p>
    </Section>
  );
}

// ------------------------------------------------------------
// 4 コース
// ------------------------------------------------------------

export async function CourseSection() {
  const list = Object.values(courses);
  const lessons = await fetchLessons(list.flatMap(lessonSlugs));
  return (
    <Section className="border-t border-black/[0.12]">
      <SectionHeader
        eyebrow="COURSES / 順番に身につける"
        title="コースで、順番に身につける"
        titleKari
        link={{ href: "/dev/course-pages", label: "コース一覧" }}
      />
      <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((course) => {
          const { main } = splitTitle(course.title.text);
          const counts = courseCounts(course);
          return (
            <li key={course.slug}>
              <Link href={`/dev/course-pages/v2/${course.slug}`} className="group flex h-full flex-col gap-4">
                <CourseEyecatch
                  covers={pickCovers(course, lessons)}
                  label={course.shortTitle.text}
                  meta={`${counts.lessons} lessons`}
                  sizes="(min-width: 1280px) 80px, 25vw"
                  className="transition-shadow group-hover:shadow-[var(--shadow-md)]"
                />
                <div className="flex flex-1 flex-col gap-3">
                  <span className="inline-flex w-fit items-center rounded-full border border-text-secondary px-2 py-0.5 text-[11px] font-bold text-text-secondary">
                    最初の1本は無料
                  </span>
                  <h3 className="text-balance font-heading text-lg font-bold leading-[1.5] text-text-primary [word-break:auto-phrase] group-hover:underline group-hover:underline-offset-4">
                    {main}
                  </h3>
                  <p className="font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
                    <F f={course.change} />
                  </p>
                  <dl className="mt-auto flex flex-col gap-1 border-t border-black/[0.08] pt-3 text-[13px] leading-[1.7]">
                    <div className="flex gap-3">
                      <dt className="w-[56px] shrink-0 text-text-muted">期間</dt>
                      <dd className="min-w-0 font-medium text-text-primary">
                        <F f={course.period} />
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-[56px] shrink-0 text-text-muted">制作物</dt>
                      <dd className="min-w-0 font-medium text-text-primary">
                        <F f={course.deliverable} />
                      </dd>
                    </div>
                  </dl>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-text-primary">
                    目次を見る
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function CourseSectionSkeleton() {
  return (
    <Section className="border-t border-black/[0.12]">
      <div className="h-[420px] animate-pulse rounded-[20px] bg-muted-custom motion-reduce:animate-none" aria-hidden="true" />
    </Section>
  );
}

// ------------------------------------------------------------
// 5 転職の道のり（v6 のステップ）
// ------------------------------------------------------------

export function CareerPathSection() {
  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow="CAREER ROADMAP / 転職の道のり"
        title="UIUXデザイナーへの道のり"
        titleKari
        link={{ href: V6_BASE, label: "ロードマップ全体を見る" }}
      />
      {/* 白いカードにステップを並べる（RoadmapPathway の形）。PC は2列 */}
      <ol className="mt-10 grid grid-cols-1 gap-2 rounded-[20px] border border-border-light bg-base p-2 lg:grid-cols-2">
        {v6Steps.map((step) => (
          <li key={step.id}>
            <Link
              href={v6Step(step.n)}
              className="group flex items-center gap-4 rounded-xl bg-surface p-4 transition-colors hover:bg-hover lg:p-5"
            >
              <span className="w-[52px] shrink-0 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-xs)]" aria-hidden="true">
                <span className="block bg-muted-custom py-1 text-center text-[8px] font-bold leading-[1.4] text-text-primary">
                  ステップ
                </span>
                <span className="block py-1 text-center font-latin text-[15px] font-bold leading-[1.4] text-text-primary">
                  {String(step.n).padStart(2, "0")}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-noto-sans-jp text-[15px] font-bold leading-[1.6] text-text-primary">
                  <span className="sr-only">ステップ{step.n} </span>
                  {step.short}
                </h3>
                <span className="block truncate text-xs leading-[1.6] text-text-muted">
                  {step.period.text}
                  {step.period.kari ? <Kari /> : null}
                </span>
              </div>
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ------------------------------------------------------------
// 6 ひとりで抱えない
// ------------------------------------------------------------

const ICON = { size: 24, color: "currentColor", variant: "Outline" as const };

const SUPPORTS = [
  {
    title: "フィードバック",
    body: "つくったものを、プロのデザイナーに見てもらえる。",
    href: "/how-to/feedback",
    icon: <Messages1 {...ICON} />,
  },
  {
    title: "掲示板",
    body: "つまずいたところを、メンバーに質問・相談できる。",
    href: "/questions",
    icon: <MessageQuestion {...ICON} />,
  },
  {
    title: "イベント Design Hours",
    body: "集まって、一緒に手を動かす時間。",
    href: "/events",
    icon: <Calendar2 {...ICON} />,
  },
];

export function SupportSection() {
  return (
    <Section className="border-t border-black/[0.12]">
      <SectionHeader eyebrow="WITH PEOPLE / 人と学ぶ" title="ひとりで抱えない" titleKari />
      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUPPORTS.map((s) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="group flex h-full flex-col gap-6 rounded-[20px] border border-border-light bg-surface p-6 transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
            >
              <span
                className="flex size-12 items-center justify-center rounded-2xl border-[0.5px] border-black/10 text-text-primary"
                style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
                aria-hidden="true"
              >
                {s.icon}
              </span>
              <div className="flex flex-1 items-end justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold leading-[1.5] text-text-primary">{s.title}</h3>
                  <span className="mt-1 block text-sm leading-[1.7] text-text-secondary">
                    {s.body}
                    <Kari />
                  </span>
                </div>
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  className="mb-1 shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ------------------------------------------------------------
// 8 みんなの実績（本番のまま）
// ------------------------------------------------------------

export async function Achievements() {
  const groups = await getAchievementGroups(3);
  return (
    <div className="px-6 lg:px-12">
      <AchievementHighlightSection compact storyItems={groups.stories} outputItems={groups.outputs} />
    </div>
  );
}

export function AchievementsSkeleton() {
  return (
    <div className="px-6 lg:px-12">
      <AchievementHighlightSection compact loading storyItems={[]} outputItems={[]} />
    </div>
  );
}

// ------------------------------------------------------------
// 9 メンバーの案内（未ログインだけ）＋ BONOについて
// ------------------------------------------------------------

const INCLUDES = ["コースとレッスンがすべて見放題", "フィードバック（フィードバックプラン）", "掲示板で質問・相談", "イベントに参加"];

export function MemberGuide() {
  return (
    <Section>
      <div className="flex flex-col gap-8 rounded-[24px] bg-surface p-6 shadow-[var(--shadow-xs)] md:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-noto-sans-jp text-xs font-bold tracking-[0.16em] text-cta-primary-hover">MEMBERSHIP / メンバーになると</p>
          <h2 className="mt-3 font-heading text-[24px] font-bold leading-[1.4] text-text-primary lg:text-[28px]">
            BONOのメンバーでできること
            <Kari className="ml-2 align-middle" />
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {INCLUDES.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-text-primary">
                <Check size={16} aria-hidden="true" className="shrink-0 text-cta-primary-hover" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <p className="font-noto-sans-jp text-text-primary">
            <span className="text-sm">月</span>
            <span className="font-latin text-[32px] font-bold">5,800</span>
            <span className="text-sm">円〜</span>
          </p>
          <Button variant="primary" size="hero-cta" asChild>
            <Link href="/subscription">
              BONOをはじめる
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        BONOをつくっている人と考え方は
        <a
          href="https://kaikun.bo-no.design/about"
          className="mx-1 font-bold text-text-primary underline underline-offset-4"
        >
          BONOについて
        </a>
        へ
      </p>
    </Section>
  );
}
