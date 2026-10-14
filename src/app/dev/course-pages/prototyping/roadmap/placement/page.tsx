/**
 * /dev/course-pages/prototyping/roadmap/placement — A サイト内の見せ方（#243）
 *
 * 4つのモックを縦に並べ、それぞれに「どこで・誰に・何を訴求するか」の注釈を付ける。
 * 1. サイドナビの並び（マイページ → コース → ロードマップ）
 * 2. 未ログインのトップ:「目的から選ぶ」入口で6本を短く
 * 3. マイページ: 行き先を選んだ人の「いまここ」の小さな地図（「続きから」の下）
 * 4. コース修了の画面: 「〇〇ロードマップ いまここ 3/5（2つ完了）。次はこのコース」
 * どれも静的なモック。押せる見た目のものだけ白。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Book1, Calendar2, Home2, Map, MessageQuestion, Teacher, User } from "iconsax-react";
import { cn } from "@/lib/utils";
import { courses, getCourse, lessonSlugs, progressMocks } from "../../../data";
import { getRoadmap, roadmaps } from "../../../data/roadmaps";
import { fetchLessons } from "../../../data/sanity-lessons";
import CourseEyecatch, { pickCovers } from "../../../template/CourseEyecatch";
import { KariProvider, T } from "../../../template/kari";
import { ProgressBar, hereLabel } from "../../../template/path";
import { computeProgress } from "../../../template/progress";
import { splitTitle } from "../../../template/shared";
import { MiniPath, ROADMAP_BASE } from "../parts";

export const metadata: Metadata = {
  title: "サイト内の見せ方（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

function Annotation({ where, who, what }: { where: string; who: string; what: string }) {
  return (
    <dl className="grid gap-2 rounded-[16px] bg-[var(--persona-hero-surface)] px-5 py-4 text-[13px] leading-[1.75] md:grid-cols-3 md:gap-5">
      {[
        ["どこで", where],
        ["誰に", who],
        ["何を訴求するか", what],
      ].map(([k, v]) => (
        <div key={k}>
          <dt className="text-[11px] font-bold text-text-muted">{k}</dt>
          <dd className="mt-0.5 text-text-primary">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function MockFrame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[20px] border border-border-default", className)}>
      <p className="border-b border-border-light px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function Block({
  no,
  title,
  children,
  note,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
  note: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`pl-${no}`} className="border-t border-border-light py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">{no}</p>
      <h2 id={`pl-${no}`} className="mt-1.5 font-heading text-[22px] font-bold tracking-[-0.03em] md:text-[26px]">
        {title}
      </h2>
      <div className="mt-5">{note}</div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function NavItem({
  icon,
  label,
  sub,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  active?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm",
        active ? "bg-surface font-bold text-text-primary shadow-[var(--shadow-xs)]" : "text-text-secondary"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        {label}
        {sub ? <span className="block text-[10px] font-medium text-text-muted">{sub}</span> : null}
      </span>
    </li>
  );
}

export default async function PlacementPage() {
  const lessons = await fetchLessons(Object.values(courses).flatMap(lessonSlugs));
  const career = getRoadmap("career-change")!;

  // マイページ: 進行中のコース（基礎）と、選んだ行き先（未経験から転職）
  const visual = getCourse("ui-design-visual")!;
  const visualProgress = computeProgress(visual, lessons, progressMocks[visual.slug] ?? {});
  // 修了画面: 基礎を修了 → 次は体験
  const nextCourse = getCourse("ui-experience")!;
  const next = splitTitle(nextCourse.title.text);
  const icon = { size: 18, color: "currentColor", variant: "Linear" as const };

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-28 pt-8 md:px-10 md:pt-12">
          <Link href={ROADMAP_BASE} className="text-xs text-text-muted hover:text-text-primary">
            ← ロードマップのプロト
          </Link>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">A · Placement</p>
          <h1 className="mt-2 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
            サイト内の見せ方
          </h1>
          <p className="mt-3 max-w-[680px] text-[15px] leading-[1.9] text-text-secondary">
            迷っている人はロードマップで行き先を選び、決まっている人はコースへ直接、会員は普段マイページの「続きから」。ロードマップを、どこで誰に見せるかの4つのモックです。
          </p>

          {/* 1. サイドナビ */}
          <Block
            no="01"
            title="サイドナビの並び"
            note={
              <Annotation
                where="全ページの左のサイドナビ（モバイルはメニュー）"
                who="会員と未ログインの全員"
                what="会員は一番上の「マイページ（続きから）」で今日の1つへ。決まっている人は「コース」、迷っている人は「ロードマップ（目的から選ぶ）」へ分かれる並びにする"
              />
            }
          >
            <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
              <MockFrame label="Sidebar（モック）" className="bg-muted-custom">
                <ul className="flex flex-col gap-1 p-3">
                  <NavItem icon={<User {...icon} />} label="マイページ" sub="続きから" active />
                  <NavItem icon={<Book1 {...icon} />} label="コース" />
                  <NavItem icon={<Map {...icon} />} label="ロードマップ" sub="目的から選ぶ" />
                  <li className="my-1 border-t border-border-light" aria-hidden="true" />
                  <NavItem icon={<Home2 {...icon} />} label="トップ" />
                  <NavItem icon={<Teacher {...icon} />} label="レッスン" />
                  <NavItem icon={<MessageQuestion {...icon} />} label="掲示板" />
                  <NavItem icon={<Calendar2 {...icon} />} label="イベント" />
                </ul>
              </MockFrame>
              <ul className="flex flex-col gap-3 text-[13px] leading-[1.8] text-text-secondary">
                <li>
                  <strong className="text-text-primary">今の本番</strong>：マイページ → トップ → ロードマップ → 掲示板 → レッスン …（コースの項目はない）
                </li>
                <li>
                  <strong className="text-text-primary">この案</strong>：毎日使う「続きから」を一番上に。中身の単位である「コース」を2番目、地図である「ロードマップ」を3番目に置き、ラベルの下に役割を小さく書く
                </li>
                <li>「レッスン」は単体で探したい人向けに残すが、コースの下へ下げる</li>
              </ul>
            </div>
          </Block>

          {/* 2. 未ログインのトップ */}
          <Block
            no="02"
            title="未ログインのトップ：「目的から選ぶ」入口"
            note={
              <Annotation
                where="トップページのヒーロー直下（検索・YouTubeから来た人が最初に見る場所）"
                who="まだ課金していない、何から始めるか迷っている人"
                what="自分の状況に近い行き先を1つ選ぶだけで、最初の1コースが決まること。6本を短く並べ、全部を読ませない"
              />
            }
          >
            <MockFrame label="Top（未ログイン・モック）">
              <div className="px-5 py-6 md:px-7">
                <p className="font-heading text-xl font-bold">目的から選ぶ</p>
                <p className="mt-1 text-[13px] text-text-secondary">なりたい状態に近いものを選ぶと、進む順番が分かります。</p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {roadmaps.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`${ROADMAP_BASE}/${r.slug}`}
                        className="group flex h-full items-center gap-3 rounded-[14px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] hover:border-border-default"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold leading-[1.5]">{r.name}</span>
                          <span className="mt-0.5 line-clamp-1 block text-[11px] text-text-muted">
                            <T f={r.audience} />
                          </span>
                        </span>
                        <ArrowRight size={16} className="shrink-0 text-text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`${ROADMAP_BASE}/list`} className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold hover:underline">
                  3つの質問で選ぶ
                  <ArrowRight size={14} />
                </Link>
              </div>
            </MockFrame>
            <Link
              href={`${ROADMAP_BASE}/applied/top`}
              className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-text-link hover:underline"
            >
              実物のトップに当てはめると
              <ArrowRight size={14} />
            </Link>
          </Block>

          {/* 3. マイページ */}
          <Block
            no="03"
            title="マイページ：「いまここ」の小さな地図"
            note={
              <Annotation
                where="マイページの「続きから」のすぐ下（行き先を選んだ人だけ）"
                who="課金中で、行き先（ロードマップ）を選んでいる会員"
                what="今日の1つ（続きから）の先に、長いゴールのどこまで来たかを見せる。止まっていた人が戻る理由にする"
              />
            }
          >
            <MockFrame label="Mypage（モック）" className="mx-auto max-w-3xl">
              <div className="flex flex-col gap-4 px-5 py-5">
                <div>
                  <p className="mb-2 font-heading text-base font-bold">続きから</p>
                  <Link
                    href={`/dev/course-pages/v2/${visual.slug}?progress=1`}
                    className="flex items-center gap-4 rounded-[18px] border border-border-light bg-surface p-4 shadow-[var(--shadow-xs)] hover:border-border-default"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-text-muted">{splitTitle(visual.title.text).main}</p>
                      <p className="mt-0.5 font-heading text-[15px] font-bold">
                        {visualProgress.resume
                          ? `${visualProgress.resume.title}の記事${visualProgress.resume.articleNumber}`
                          : "すべて完了"}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <ProgressBar value={visualProgress.percent} className="h-1.5 flex-1" />
                        <span className="text-xs font-bold text-text-secondary">{visualProgress.percent}%</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-text-muted" />
                  </Link>
                </div>
                <Link
                  href={`${ROADMAP_BASE}/${career.slug}?progress=1`}
                  className="block rounded-[18px] border border-border-light bg-surface px-4 py-3.5 shadow-[var(--shadow-xs)] hover:border-border-default"
                >
                  <p className="flex items-center justify-between text-xs font-bold text-text-muted">
                    <span>あなたの行き先：{career.name}</span>
                    <span>{hereLabel(1, career.stops.length)}</span>
                  </p>
                  <MiniPath roadmap={career} done={1} className="mt-3" />
                </Link>
              </div>
            </MockFrame>
          </Block>

          {/* 4. コース修了の画面 */}
          <Block
            no="04"
            title="コース修了の画面：次のコースへつなぐ"
            note={
              <Annotation
                where="コースの最後のレッスンを終えたときの完了画面"
                who="1つのコースを修了した会員"
                what="区切りの「できた」を祝い、行き先のどこまで来たかと次の1コースを同時に見せる。修了＝解約のきっかけにしない"
              />
            }
          >
            <MockFrame label="Course complete（モック）" className="mx-auto max-w-[560px]">
              <div className="px-6 py-7 text-center">
                <p className="text-3xl" aria-hidden="true">🎉</p>
                <p className="mt-2 font-heading text-xl font-bold">UIデザイン基礎コースを修了しました</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {career.name}ロードマップ <strong className="text-text-primary">{hereLabel(2, career.stops.length)}</strong>
                </p>
                <MiniPath roadmap={career} done={2} className="mx-auto mt-4 max-w-[400px]" />
                <p className="mt-6 text-left text-xs font-bold text-text-muted">次はこのコース</p>
                <Link
                  href={`/dev/course-pages/v2/${nextCourse.slug}`}
                  className="mt-2 flex items-center gap-4 rounded-[18px] border border-border-light bg-surface p-3 text-left shadow-[var(--shadow-xs)] hover:border-border-default"
                >
                  <div className="w-[120px] shrink-0">
                    <CourseEyecatch covers={pickCovers(nextCourse, lessons)} label="" sizes="32px" className="rounded-[12px]" plannedLabel="近日公開" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[15px] font-bold leading-[1.5]">{next.main}</p>
                    <p className="text-xs text-text-secondary">{next.sub}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-text-muted" />
                </Link>
              </div>
            </MockFrame>
          </Block>
        </div>
      </div>
    </KariProvider>
  );
}
