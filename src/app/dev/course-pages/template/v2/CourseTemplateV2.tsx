/**
 * テンプレート v2（完成形）: コース詳細ページの組み立て — #242 問1の改善点を入れたもの
 *
 * v1（../CourseTemplate.tsx）との違い
 * 1. 自分ごと: ヒーローに「こんな人向け」、得られる変化を書き直し、FAQ に「向いていない人」
 * 2. 意味の見返し: 進行中の会員のときだけ、ヒーロー直下に「あなたが目指していること」
 * 3. 目安時間: レッスン行に「約◯分」、ヒーローにコース全体の合計
 * 4. 終えた後: カリキュラムの後に「修了したら次は」
 * 5. 未制作 → 近日公開、件数は「公開中・近日公開」
 * 6. 料金: ヒーローのボタン近くと最後の CTA
 * カリキュラムはシラバス（大）で固定。
 *
 * ヒーローの切り替え（#241）: hero=01〜04 のときは Figma のヒーローを器の外（全幅）に置き、
 * v2 ヒーローにしか無い項目（こんな人向け・説明文・期間/件数/動画・料金・進み具合）は直下の HeroSummary にまとめる。
 */

import type { Course, LessonMap, ProgressMock } from "../../data/types";
import CourseAudience from "../CourseAudience";
import CourseAuthor from "../CourseAuthor";
import CourseChange from "../CourseChange";
import CourseCurriculumSyllabus from "../CourseCurriculumSyllabus";
import CourseFaq from "../CourseFaq";
import CourseFinalCta from "../CourseFinalCta";
import CourseFlow from "../CourseFlow";
import CourseOutput from "../CourseOutput";
import CourseHeroBand from "../hero/CourseHeroBand";
import CourseHeroCards from "../hero/CourseHeroCards";
import CourseHeroCentered from "../hero/CourseHeroCentered";
import CourseHeroSplit from "../hero/CourseHeroSplit";
import type { CourseHeroProps } from "../hero/parts";
import { KariProvider } from "../kari";
import { computeProgress } from "../progress";
import { numberSteps, pad2 } from "../shared";
import CourseHeroV2 from "./CourseHeroV2";
import CourseNext from "./CourseNext";
import GoalReminder from "./GoalReminder";
import HeroSummary from "./HeroSummary";
import HeroSwitch, { type HeroVariant } from "./HeroSwitch";
import PriceNote from "./PriceNote";

const FIGMA_HEROES: Record<Exclude<HeroVariant, "v2">, (props: CourseHeroProps) => React.ReactNode> = {
  "01": CourseHeroSplit,
  "02": CourseHeroCards,
  "03": CourseHeroCentered,
  "04": CourseHeroBand,
};

export default function CourseTemplateV2({
  course,
  lessons,
  progressMock,
  nextCourse,
  started = null,
  resumeArticleTitle = null,
  hero = "v2",
  heroHrefs,
  startedHref,
}: {
  course: Course;
  lessons: LessonMap;
  progressMock: ProgressMock | null;
  nextCourse: Course | null;
  /** #243 トピック4: 進めているコースか（null は従来どおり） */
  started?: boolean | null;
  /** 続きからの記事タイトル（進めているときだけ） */
  resumeArticleTitle?: string | null;
  /** #241 ヒーローの版（v2 = 前の形） */
  hero?: HeroVariant;
  /** ヒーロー切り替えのリンク（渡したときだけ切り替えの帯を出す） */
  heroHrefs?: Record<HeroVariant, string>;
  /** started=0 のとき「このコースを始める」の行き先（?started=1。ほかのクエリを残したもの） */
  startedHref?: string;
}) {
  const v2 = course.v2!;
  // 書き直した「得られる変化」で描く（Figma 原文は course.change に残っている）
  const shown: Course = { ...course, change: v2.change, faq: [...course.faq, v2.notFor] };
  const progress = progressMock ? computeProgress(course, lessons, progressMock) : null;

  const items = course.steps.flatMap((s) => s.items);
  const first = items.find((i) => i.type === "lesson");
  const startHref = first && first.type === "lesson" ? `/lessons/${first.slug}` : null;
  const totalMinutes =
    items.reduce((sum, i) => sum + (i.type === "lesson" ? (lessons[i.slug]?.videoMinutes ?? 0) : 0), 0) || null;

  const currentIndex = progress ? progress.steps.findIndex((s) => s.status === "current") : -1;
  const current = currentIndex >= 0 ? numberSteps(course)[currentIndex] : null;
  const currentLabel = current
    ? current.step.kind === "challenge"
      ? "チャレンジ"
      : `STEP ${pad2(current.goalNumber ?? 0)}`
    : null;

  const FigmaHero = hero === "v2" ? null : FIGMA_HEROES[hero];

  return (
    <KariProvider preview={{ progress: Boolean(progressMock) }}>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        {heroHrefs ? (
          <HeroSwitch
            current={hero}
            hrefs={heroHrefs}
            v1Href={hero === "v2" ? null : `/dev/course-pages/${course.slug}`}
          />
        ) : null}
        {FigmaHero ? (
          <FigmaHero
            course={course}
            lessons={lessons}
            startHref={started === false ? (startedHref ?? startHref) : startHref}
            curriculumHref="#curriculum"
            headingLevel={1}
            started={started}
            resume={
              progress?.resume
                ? {
                    href: `/lessons/${progress.resume.slug}`,
                    title: resumeArticleTitle ?? `${progress.resume.title}の記事${progress.resume.articleNumber}`,
                  }
                : null
            }
          />
        ) : null}
        <div className="mx-auto w-full max-w-[1180px] px-4 md:px-10">
          {FigmaHero ? (
            <HeroSummary course={course} v2={v2} progress={progress} totalMinutes={totalMinutes} />
          ) : (
            <CourseHeroV2
              course={course}
              v2={v2}
              lessons={lessons}
              startHref={startHref}
              progress={progress}
              totalMinutes={totalMinutes}
              started={started}
              resumeArticleTitle={resumeArticleTitle}
            />
          )}
          {progress ? (
            <GoalReminder finalGoal={course.finalGoal} step={current?.step ?? null} stepLabel={currentLabel} />
          ) : null}
          <CourseChange course={shown} />
          <CourseFlow course={shown} statuses={progress?.steps.map((st) => st.status)} />
          <CourseCurriculumSyllabus course={shown} lessons={lessons} progress={progress} size="lg" v2 />
          <CourseNext v2={v2} nextCourse={nextCourse} />
          <CourseOutput course={shown} />
          <CourseAudience course={shown} />
          <CourseAuthor course={shown} />
          <CourseFaq course={shown} />
          <CourseFinalCta course={shown} startHref={startHref} price={<PriceNote inverse />} />
        </div>
      </div>
    </KariProvider>
  );
}
