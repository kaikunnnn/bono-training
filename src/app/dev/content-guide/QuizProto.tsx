"use client";

/**
 * B案: 1問ずつのクイズ型（12_診断UI_A案B案_仕様書 §5）。/dev/content-guide/quiz
 *
 * 導入 → Q1 いまのあなたに近いのは？（段階の3択）→ Q2 どんな状態になりたい？（選んだ段階の5〜7個）
 * → Q3 もうできていることは？（前提がない目標は飛ばす）→ 診断中…（約1.2秒）→ 診断結果。
 * - 1画面に1問。1画面の選択肢は最大7。選んだら即次へ（DS patterns.md §3「選択で前進」）。
 * - 見出し: h1 はページに1つ（「スキル診断」）。各画面の問いが h2、選択肢のカードが h3。
 * - 画面の切り替えで、問いの見出しへフォーカス。ブラウザの戻るで前の問いへ。
 */

import type { RefObject } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS, type StageGroupId } from "@/lib/content-guide/display";
import { hasPrerequisites } from "@/lib/content-guide/path";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { CheckStep } from "./CheckStep";
import { DevControls } from "./DevControls";
import {
  DiagnosingScreen,
  FlowResult,
  QuestionProgress,
  useDiagnosing,
  useFlow,
  useStepFocus,
} from "./FlowShared";
import { resultCardClass } from "./ResultSections";
import type { Viewer } from "./query";

/** Q1 の3択（平易な言葉）。数と例は STAGE_GROUPS から */
const STAGE_CHOICES: Record<StageGroupId, string> = {
  basic: "まず基本を身につけたい",
  practice: "使える力にしたい",
  advanced: "さらに伸ばしたい",
};

const choiceCardClass =
  "group relative flex min-h-11 flex-col gap-1.5 rounded-[16px] border-2 border-border bg-surface p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 hover:border-primary/50 hover:bg-muted/30 sm:p-5";

const stretchedButtonClass =
  "text-left after:absolute after:inset-0 after:rounded-[14px] after:content-[''] focus-visible:outline-none";

function QuestionHeading({
  headingRef,
  id,
  children,
  description,
}: {
  headingRef: RefObject<HTMLElement | null>;
  id: string;
  children: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h2
        id={id}
        ref={headingRef as RefObject<HTMLHeadingElement | null>}
        tabIndex={-1}
        className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
      >
        {children}
      </h2>
      {description && <p className="text-sm leading-relaxed text-text-secondary">{description}</p>}
    </div>
  );
}

export function QuizProto() {
  const { query, navigate } = useFlow("quiz");
  const stepKey = `${query.step}:${query.stage ?? ""}:${query.goal ?? ""}`;
  const headingRef = useStepFocus(stepKey);
  const { diagnosing, start } = useDiagnosing(stepKey);

  const viewer = query.viewer;
  const base: { checked: SkillStateId[]; viewer: Viewer } = { checked: [], viewer };
  const questionTotal = query.goal !== null && !hasPrerequisites(query.goal) ? 2 : 3;

  const goStage = () => navigate({ ...base, goal: null, step: "stage", stage: null });
  const goGoal = (stage: StageGroupId) => navigate({ ...base, goal: null, step: "goal", stage });
  const showResult = (goal: SkillStateId, checked: SkillStateId[]) =>
    start(() => navigate({ goal, checked, step: "result", stage: query.stage, viewer }));

  const handleSelectGoal = (goal: SkillStateId) => {
    trackContentGuide("content_guide_goal_select", {
      goal_state_id: goal,
      has_prerequisites: hasPrerequisites(goal),
      viewer,
      variant: "quiz",
    });
    if (hasPrerequisites(goal)) {
      navigate({ ...base, goal, step: "check", stage: query.stage });
    } else {
      showResult(goal, []);
    }
  };

  const handleViewer = (v: Viewer) => navigate({ ...query, viewer: v }, "replace");

  let content: React.ReactNode;
  if (diagnosing) {
    content = <DiagnosingScreen headingRef={headingRef} />;
  } else if (query.step === "intro") {
    content = (
      <section aria-labelledby="content-guide-quiz-intro" className={`${resultCardClass} sm:p-8`} data-screen="intro">
        <h2
          id="content-guide-quiz-intro"
          ref={headingRef as RefObject<HTMLHeadingElement | null>}
          tabIndex={-1}
          className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
        >
          3つの質問で、最初の一歩がわかります
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          なりたい状態と、いまできることに答えると、そこまでの道筋と、最初に始めるレッスンを診断します。答えは保存されません。
        </p>
        <ol className="mt-5 space-y-2 text-sm text-text-primary">
          {["いまのあなたに近いのは？", "どんな状態になりたい？", "もうできていることは？"].map((q, i) => (
            <li key={q} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted-strong font-latin text-xs font-bold text-text-secondary"
              >
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ol>
        <Button type="button" size="large" className="mt-6 w-full sm:w-auto" onClick={goStage}>
          はじめる
          <ArrowRight aria-hidden="true" />
        </Button>
      </section>
    );
  } else if (query.step === "stage") {
    content = (
      <section aria-labelledby="content-guide-quiz-q1" className="space-y-5" data-screen="q1">
        <QuestionHeading
          headingRef={headingRef}
          id="content-guide-quiz-q1"
          description="迷ったら「まず基本を身につけたい」を選んでください。"
        >
          いまのあなたに近いのは？
        </QuestionHeading>
        <ul className="grid gap-3" data-choice-count={STAGE_GROUPS.length}>
          {STAGE_GROUPS.map((g) => (
            <li key={g.id} className={choiceCardClass} data-choice>
              <h3 className="pr-7 font-heading text-lg font-bold leading-7 text-text-primary">
                <button type="button" onClick={() => goGoal(g.id)} className={stretchedButtonClass}>
                  {STAGE_CHOICES[g.id]}
                </button>
              </h3>
              <p className="text-xs text-text-muted">
                {g.stageLabel}・{g.stateIds.length}個のスキル
              </p>
              <p className="text-xs leading-5 text-text-secondary">
                例: {g.stateIds.slice(0, 3).map((id) => SHORT_TITLES[id]).join("／")}
              </p>
              <ArrowRight
                aria-hidden="true"
                className="absolute right-4 top-5 size-4 text-text-muted transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </li>
          ))}
        </ul>
      </section>
    );
  } else if (query.step === "goal" && query.stage) {
    const group = STAGE_GROUPS.find((g) => g.id === query.stage) ?? STAGE_GROUPS[0];
    content = (
      <section aria-labelledby="content-guide-quiz-q2" className="space-y-5" data-screen="q2">
        <QuestionHeading
          headingRef={headingRef}
          id="content-guide-quiz-q2"
          description={
            <>
              「{STAGE_CHOICES[group.id]}」の{group.stateIds.length}個から、ひとつ選んでください。
            </>
          }
        >
          どんな状態になりたい？
        </QuestionHeading>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2" data-choice-count={group.stateIds.length}>
          {group.stateIds.map((id) => (
            <li key={id} className={choiceCardClass} data-choice>
              <h3 className="pr-7 text-[15px] font-bold leading-6 text-text-primary">
                <button type="button" onClick={() => handleSelectGoal(id)} className={stretchedButtonClass}>
                  {SHORT_TITLES[id]}
                </button>
              </h3>
              <p className="text-xs leading-5 text-text-secondary">{SKILL_STATES[id].label}</p>
              <ArrowRight
                aria-hidden="true"
                className="absolute right-4 top-4 size-4 text-text-muted transition-transform motion-safe:group-hover:translate-x-0.5 sm:top-5"
              />
            </li>
          ))}
        </ul>
        <Button type="button" variant="ghost" size="large" onClick={goStage}>
          <ChevronLeft aria-hidden="true" />
          ほかの段階を見る
        </Button>
      </section>
    );
  } else if (query.goal && query.step === "check") {
    const goal = query.goal;
    content = (
      <div data-screen="q3">
        <CheckStep
          headingRef={headingRef}
          goal={goal}
          checked={query.checked}
          onChange={(checked) => navigate({ ...query, checked }, "replace")}
          onBack={() => goGoal(query.stage ?? "basic")}
          onNext={() => showResult(goal, query.checked)}
          backLabel="目標を選び直す"
          nextLabel={(n) => (n === 0 ? "まだどれもできない。診断する" : "診断する")}
        />
      </div>
    );
  } else if (query.goal && query.step === "result") {
    content = (
      <FlowResult
        goal={query.goal}
        checked={query.checked}
        viewer={viewer}
        variant="quiz"
        headingRef={headingRef}
        summarySize="large"
        onRestart={goStage}
        onEditChecked={() => navigate({ ...query, step: "check" })}
      />
    );
  }

  const questionIndex =
    query.step === "stage" ? 1 : query.step === "goal" ? 2 : query.step === "check" ? 3 : null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto w-full min-w-0 max-w-[752px] px-4 py-8 sm:px-6 sm:py-12">
        <DevControls
          viewer={viewer}
          onViewer={handleViewer}
          variant="quiz"
          carry={{ goal: query.goal, checked: query.checked, isResult: query.step === "result" }}
        />

        <header className="mt-6">
          <p className="text-xs font-bold tracking-wider text-text-muted">コンテンツガイド</p>
          <h1 className="mt-1 font-heading text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
            スキル診断
          </h1>
        </header>

        {questionIndex !== null && !diagnosing && (
          <QuestionProgress className="mt-5" current={questionIndex} total={questionTotal} />
        )}

        <div
          className="mt-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
          key={diagnosing ? "diagnosing" : stepKey}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
