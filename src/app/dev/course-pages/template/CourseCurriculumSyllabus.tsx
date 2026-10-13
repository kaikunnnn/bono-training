/**
 * テンプレート＝全コース共通: カリキュラム（シラバス版・既定）— #241
 *
 * 参考: Maven の Course syllabus。h2 の下に1行のまとめ → ステップごとに角丸の枠1つ。
 *   枠の上部: STEP ラベル / ステップ名（h3）/ 習得すること：〜（gain）/ 進捗時のみ右上に「1/1 完了」
 *   区切り線のあとにレッスンの行（行の間も区切り線。h4）
 * 枠と枠の間は短い縦のコネクタで「下へ進む」流れを見せる。全幅の横線・横の道のりは使わない。
 * 枠は背景なし（白はクリックできる行のホバーにも使わない。行のホバーは淡い色）。
 * size="lg"（シラバス（大））は見た目はそのままで、レッスンの行の表紙（72×108）・文字・余白だけ大きくする。
 */

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { Magicpen } from "iconsax-react";
import { cn } from "@/lib/utils";
import type {
  Course,
  CourseStep,
  LessonMap,
  PlannedLessonRef,
  ResolvedLesson,
} from "../data/types";
import { T } from "./kari";
import { ProgressBar } from "./path";
import type { CourseProgress, LessonProgress, StepProgress } from "./progress";
import {
  LessonCover,
  SectionHead,
  courseCounts,
  formatMinutes,
  numberSteps,
  pad2,
} from "./shared";

const ROW = "flex items-center gap-4 px-5 py-3 md:px-6";
/** シラバス（大）: 見た目は同じで大きさだけ変える */
const ROW_LG = "flex items-center gap-4 px-5 py-4 md:gap-5 md:px-6 md:py-5";
const COVER_LG = "w-[60px] md:w-[72px]";
const TITLE_LG = "text-base md:text-[18px]";

function LessonLine({
  slug,
  lesson,
  progress,
  large = false,
  v2 = false,
}: {
  slug: string;
  lesson: ResolvedLesson | null;
  progress?: LessonProgress;
  large?: boolean;
  /** v2: 1行の情報に動画の目安時間（約◯分）を足す */
  v2?: boolean;
}) {
  const time =
    v2 && lesson?.videoMinutes ? `・${formatMinutes(lesson.videoMinutes)}` : "";
  const done = Boolean(progress && progress.done === progress.total);
  const partial = Boolean(progress && progress.done > 0 && !done);
  return (
    <Link
      href={`/lessons/${slug}`}
      className={cn(
        large ? ROW_LG : ROW,
        "group transition-colors hover:bg-hover",
      )}
    >
      <LessonCover
        lesson={lesson}
        slug={slug}
        sizes={large ? "72px" : "40px"}
        className={cn(
          large ? COVER_LG : "w-10",
          "shadow-[var(--shadow-quest)]",
        )}
      />
      <div className="min-w-0 flex-1">
        <h4
          className={cn(
            large ? TITLE_LG : "text-[15px]",
            "font-bold leading-[1.5] text-text-primary",
          )}
        >
          {lesson?.title ?? slug}
        </h4>
        <p
          className={cn(
            large ? "mt-1 text-[13px]" : "mt-0.5 text-xs",
            "text-text-muted",
          )}
        >
          {!lesson ? (
            <span className="font-mono">Sanity 未取得: {slug}</span>
          ) : partial && progress ? (
            <span className="flex items-center gap-2">
              <span className="font-bold text-text-primary">
                記事 {progress.done}/{progress.total}
              </span>
              <ProgressBar
                value={(progress.done / progress.total) * 100}
                className="w-14"
              />
            </span>
          ) : large ? (
            <>
              {lesson.questCount}クエスト・記事 {lesson.articleCount}本{time}
            </>
          ) : (
            <>
              記事 {lesson.articleCount}本{time}
            </>
          )}
        </p>
      </div>
      {done ? (
        <span className="flex items-center gap-1.5 text-xs font-bold text-text-success">
          <span className="flex size-5 items-center justify-center rounded-full bg-text-success text-text-inverse">
            <Check size={12} strokeWidth={3.5} />
          </span>
          完了
        </span>
      ) : null}
      <ChevronRight
        size={18}
        className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

function PlannedLine({
  item,
  large = false,
  v2 = false,
}: {
  item: PlannedLessonRef;
  large?: boolean;
  /** v2: 「未制作」ではなく「近日公開」と出す */
  v2?: boolean;
}) {
  return (
    <div className={large ? ROW_LG : ROW}>
      <LessonCover
        plannedTitle=""
        sizes={large ? "72px" : "40px"}
        className={cn(large ? COVER_LG : "w-10", "opacity-70")}
      />
      <div className="min-w-0 flex-1">
        <h4
          className={cn(
            large ? TITLE_LG : "text-[15px]",
            "font-bold leading-[1.5] text-text-disabled",
          )}
        >
          <T f={item.title} />
        </h4>
        {v2 ? null : (
          <p className="mt-0.5 text-xs text-text-disabled">公開準備中</p>
        )}
      </div>
      <span className="shrink-0 rounded-full border border-border-light px-2 py-0.5 text-[11px] font-bold text-text-muted">
        {v2 ? "近日公開" : "未制作"}
      </span>
    </div>
  );
}

function ChallengeLine({ step }: { step: CourseStep }) {
  if (!step.brief) return null;
  return (
    <div className={ROW}>
      <span className="flex w-6 shrink-0 items-center justify-center self-start pt-0.5 text-text-secondary sm:h-[60px] sm:w-10 sm:self-center sm:pt-0">
        <Magicpen size={22} color="currentColor" variant="Linear" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-bold leading-[1.6] text-text-primary">
          <span className="mr-1">お題：</span>
          <T f={step.brief.description} />
        </h4>
      </div>
      <span className="hidden shrink-0 font-latin text-[11px] font-bold tracking-[0.08em] text-text-muted sm:inline">
        提出物 {step.brief.deliverables.length}つ
      </span>
    </div>
  );
}

function StepStatusText({ sp }: { sp?: StepProgress }) {
  if (!sp) return null;
  if (sp.lessonsTotal > 0) {
    return (
      <span
        className={cn(
          "shrink-0 text-xs font-bold",
          sp.status === "done" ? "text-text-success" : "text-text-secondary",
        )}
      >
        {sp.status === "done" ? "✓ " : ""}
        {sp.lessonsDone}/{sp.lessonsTotal} 完了
      </span>
    );
  }
  return null;
}

export default function CourseCurriculumSyllabus({
  course,
  lessons,
  progress,
  size = "md",
  v2 = false,
}: {
  course: Course;
  lessons: LessonMap;
  progress: CourseProgress | null;
  /** v2（完成形）: 未制作→近日公開、件数を「公開中・近日公開」に分ける、レッスンの目安時間を出す */
  v2?: boolean;
  /** lg = シラバス（大）: 見た目は同じで、レッスンの行の表紙・文字・余白だけ大きくする */
  size?: "md" | "lg";
}) {
  const large = size === "lg";
  const counts = courseCounts(course);
  const numbered = numberSteps(course);
  const summary = [
    `ステップ ${counts.goals}つ`,
    v2
      ? `公開中 ${counts.lessons - counts.planned}本・近日公開 ${counts.planned}本`
      : `レッスン ${counts.lessons}本${counts.planned > 0 ? `（うち未制作 ${counts.planned}本）` : ""}`,
    counts.hasChallenge ? "チャレンジ 1つ" : null,
  ].filter(Boolean);

  return (
    <section
      id="curriculum"
      aria-labelledby="course-curriculum"
      className="scroll-mt-16 border-t border-border-light py-16 md:py-20"
    >
      <SectionHead
        id="course-curriculum"
        kicker="Curriculum"
        title="カリキュラム"
      />
      <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium text-text-secondary">
        {summary.map((s, i) => (
          <span key={i} className="flex items-center gap-2.5">
            {i > 0 ? (
              <span aria-hidden="true" className="text-text-disabled">
                •
              </span>
            ) : null}
            {s}
          </span>
        ))}
      </p>

      <ol className="mt-10 max-w-[880px]">
        {numbered.map(({ step, index, goalNumber }) => {
          const challenge = step.kind === "challenge";
          const sp = progress?.steps[index];
          const current = sp?.status === "current";
          return (
            <li key={index}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="ml-8 block h-8 w-px bg-border-default md:ml-9"
                />
              ) : null}
              <div
                id={`curriculum-step-${index + 1}`}
                className={cn(
                  "scroll-mt-24 overflow-hidden rounded-[20px] border",
                  current ? "border-text-primary/40" : "border-border-light",
                )}
              >
                <div className="px-5 pb-4 pt-5 md:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={cn(
                        "font-latin text-[11px] font-bold tracking-[0.12em]",
                        challenge ? "text-text-link-hover" : "text-text-muted",
                      )}
                    >
                      {challenge
                        ? "CHALLENGE"
                        : `STEP ${pad2(goalNumber ?? 0)}`}
                    </p>
                    <StepStatusText sp={sp} />
                  </div>
                  <h3 className="mt-1.5 font-heading text-[19px] font-bold leading-[1.5] tracking-[-0.02em] text-text-primary md:text-[21px]">
                    <T f={step.title} />
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[1.75] text-text-secondary md:text-base">
                    <span className="mr-1 font-bold text-text-primary">
                      習得すること：
                    </span>
                    <T f={step.gain} />
                  </p>
                </div>
                <ul className="divide-y divide-border-light border-t border-border-light">
                  {challenge ? (
                    <li>
                      <ChallengeLine step={step} />
                    </li>
                  ) : null}
                  {/* チャレンジにもレッスンがあれば、お題の行と並べて出す */}
                  {step.items.map((item, i) => (
                    <li key={i}>
                      {item.type === "lesson" ? (
                        <LessonLine
                          slug={item.slug}
                          lesson={lessons[item.slug] ?? null}
                          progress={progress?.lessons[item.slug]}
                          large={large}
                          v2={v2}
                        />
                      ) : (
                        <PlannedLine item={item} large={large} v2={v2} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
