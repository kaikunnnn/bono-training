"use client";

/**
 * B案: 1問ずつのクイズ型（12_診断UI_A案B案_仕様書 §5）。/dev/content-guide/quiz
 *
 * 導入 → Q1 いまのあなたに近いのは？（段階の3択）→ Q2 どんな状態になりたい？（選んだ段階の5〜7個）
 * → Q3 もうできていることは？（前提がない目標は飛ばす）→ 診断中…（約1.2秒）→ 診断結果。
 * - 1画面に1問。1画面の選択肢は最大7。選んだら即次へ（DS patterns.md §3「選択で前進」）。
 * - 見出し: h1 はページに1つ（「スキル診断」）。各画面の問いが h2、選択肢のカードが h3。
 * - 画面の切り替えで、問いの見出しへフォーカス。ブラウザの戻るで前の問いへ。
 *
 * 夜明けの表現（13_夜明けデザイン仕様書 §7）: 背景全体が空のステージ（DawnSky）。質問が進むごとに夜 → 夜明け前 → 暁、
 * Q3 はできている数でさらに明るく、診断中に日の出、結果は朝。Q1 の3択に 一番星／水平線の光／昇る太陽 のモチーフ。
 * 質問の進捗は、太陽が弧を描いて昇るインジケータ（数字も残す）。文字はすべて不透明なカードの上。
 */

import type { RefObject } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS, type StageGroupId } from "@/lib/content-guide/display";
import { doneStates, hasPrerequisites, prerequisitesOf } from "@/lib/content-guide/path";
import { computeSummary } from "@/lib/content-guide/summary";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { cn } from "@/lib/utils";
import { CheckStep } from "./CheckStep";
import { DevControls } from "./DevControls";
import { DAWN_PANEL, DawnSky, MotifFirstStar, MotifHorizon, MotifRisingSun, SunArcProgress } from "./Dawn";
import { DiagnosingScreen, FlowResult, useDiagnosing, useFlow, useStepFocus } from "./FlowShared";
import type { Viewer } from "./query";

/** Q1 の3択（平易な言葉）と夜明けのモチーフ。数と例は STAGE_GROUPS から */
const STAGE_CHOICES: Record<StageGroupId, { label: string; motif: string; Motif: typeof MotifFirstStar }> = {
  basic: { label: "まず基本を身につけたい", motif: "一番星", Motif: MotifFirstStar },
  practice: { label: "使える力にしたい", motif: "水平線の光", Motif: MotifHorizon },
  advanced: { label: "さらに伸ばしたい", motif: "昇る太陽", Motif: MotifRisingSun },
};

/** 選択肢のカード（不透明。選ぶ・フォーカスで光が差す） */
const choiceCardClass =
  "group relative flex min-h-11 flex-col gap-1.5 rounded-[16px] border-2 border-border bg-surface p-4 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-300 motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 hover:border-[var(--dawn-sunrise)] hover:shadow-[var(--dawn-card-glow)] has-[:focus-visible]:shadow-[var(--dawn-card-glow)] sm:p-5";

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

  // 夜明けの進み具合（13_ §2）
  let dawn = 0.05;
  if (diagnosing) dawn = 1;
  else if (query.step === "stage") dawn = 0.15;
  else if (query.step === "goal") dawn = 0.28;
  else if (query.step === "check" && query.goal) {
    const candidates = prerequisitesOf(query.goal);
    const done = doneStates(query.checked);
    dawn = 0.4 + 0.3 * (candidates.length ? candidates.filter((id) => done.has(id)).length / candidates.length : 0);
  } else if (query.step === "result" && query.goal) {
    dawn = 0.8 + 0.2 * computeSummary(query.goal, query.checked).progress;
  }

  let content: React.ReactNode;
  if (diagnosing) {
    content = <DiagnosingScreen headingRef={headingRef} />;
  } else if (query.step === "intro") {
    content = (
      <section aria-labelledby="content-guide-quiz-intro" className={cn(DAWN_PANEL, "sm:p-8")} data-screen="intro">
        <div className="mb-4 flex gap-2" aria-hidden="true">
          <MotifFirstStar className="size-10" />
          <MotifHorizon className="size-10" />
          <MotifRisingSun className="size-10" />
        </div>
        <h2
          id="content-guide-quiz-intro"
          ref={headingRef as RefObject<HTMLHeadingElement | null>}
          tabIndex={-1}
          className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
        >
          3つの質問で、あなたの夜明けを診断します
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          なりたい状態（行き先）と、もうできていることに答えると、そこまでの光の道と、最初に始めるレッスンがわかります。答えるたびに、空が明けていきます。答えは保存されません。
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
      <section aria-labelledby="content-guide-quiz-q1" className={cn(DAWN_PANEL, "space-y-5")} data-screen="q1">
        <QuestionHeading
          headingRef={headingRef}
          id="content-guide-quiz-q1"
          description="どこから始めても、夜明けはきます。迷ったら「まず基本を身につけたい」を選んでください。"
        >
          いまのあなたに近いのは？
        </QuestionHeading>
        <ul className="grid gap-3" data-choice-count={STAGE_GROUPS.length}>
          {STAGE_GROUPS.map((g) => {
            const c = STAGE_CHOICES[g.id];
            return (
              <li key={g.id} className={cn(choiceCardClass, "flex-row items-center gap-4")} data-choice>
                <c.Motif className="shrink-0" />
                <div className="min-w-0 flex-1 space-y-1 pr-6">
                  <h3 className="font-heading text-lg font-bold leading-7 text-text-primary">
                    <button type="button" onClick={() => goGoal(g.id)} className={stretchedButtonClass}>
                      {c.label}
                    </button>
                  </h3>
                  <p className="text-xs text-text-muted">
                    {c.motif}・{g.stageLabel}・{g.stateIds.length}個のスキル
                  </p>
                  <p className="text-sm leading-6 text-text-secondary">
                    例: {g.stateIds.slice(0, 3).map((id) => SHORT_TITLES[id]).join("／")}
                  </p>
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-text-muted motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                />
              </li>
            );
          })}
        </ul>
      </section>
    );
  } else if (query.step === "goal" && query.stage) {
    const group = STAGE_GROUPS.find((g) => g.id === query.stage) ?? STAGE_GROUPS[0];
    content = (
      <section aria-labelledby="content-guide-quiz-q2" className={cn(DAWN_PANEL, "space-y-5")} data-screen="q2">
        <QuestionHeading
          headingRef={headingRef}
          id="content-guide-quiz-q2"
          description={
            <>
              「{STAGE_CHOICES[group.id].label}」の{group.stateIds.length}個から、あなたの行き先をひとつ選んでください。
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
              <p className="text-sm leading-6 text-text-secondary">{SKILL_STATES[id].label}</p>
              <ArrowRight
                aria-hidden="true"
                className="absolute right-4 top-4 size-4 text-text-muted motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 sm:top-5"
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
      <div className={DAWN_PANEL} data-screen="q3">
        <CheckStep
          headingRef={headingRef}
          goal={goal}
          checked={query.checked}
          onChange={(checked) => navigate({ ...query, checked }, "replace")}
          onBack={() => goGoal(query.stage ?? "basic")}
          onNext={() => showResult(goal, query.checked)}
          backLabel="目標を選び直す"
          nextLabel={(n) => (n === 0 ? "ここから始める。診断する" : "診断する")}
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
    <DawnSky progress={dawn} durationMs={diagnosing ? 1200 : 900}>
      <div className="mx-auto w-full min-w-0 max-w-[752px] space-y-3 px-4 py-8 sm:px-6 sm:py-12">
        <DevControls
          viewer={viewer}
          onViewer={handleViewer}
          variant="quiz"
          carry={{ goal: query.goal, checked: query.checked, isResult: query.step === "result" }}
        />

        <header className={cn(DAWN_PANEL, "flex flex-wrap items-center justify-between gap-3 py-4 sm:py-5")}>
          <div>
            <p className="text-xs font-bold tracking-wider text-text-muted">コンテンツガイド</p>
            <h1 className="mt-1 font-heading text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
              スキル診断
            </h1>
          </div>
          {questionIndex !== null && !diagnosing && <SunArcProgress current={questionIndex} total={questionTotal} />}
        </header>

        <div
          className="pt-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
          key={diagnosing ? "diagnosing" : stepKey}
        >
          {content}
        </div>
      </div>
    </DawnSky>
  );
}
