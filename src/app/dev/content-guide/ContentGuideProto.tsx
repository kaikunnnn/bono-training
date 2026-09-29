"use client";

/**
 * コンテンツガイド 診断プロトタイプ（#212）。
 *
 * 流れ: ①目標のスキル状態を18個から1つ選ぶ → ②その前提になる状態だけが並び、
 * いまできることをチェック（前提がない目標は飛ばす）→ ③結果（最初の状態・目指す状態・道筋・該当レッスン）。
 *
 * - 状態は URL クエリだけで持つ（保存しない）。ステップの前進は push（ブラウザの戻るで1つ前へ）、
 *   チェックの切り替えは replace。
 * - h1 はこのコンポーネントに1つだけ。各ステップの見出しは h2。
 * - ステップが変わったら、そのステップの見出しにフォーカスを移す（キーボード・読み上げ向け）。
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SkillStateId } from "@/lib/content-guide/skill-states";
import { hasPrerequisites } from "@/lib/content-guide/path";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { buildGuideSearch, parseGuideQuery, type GuideQuery, type Viewer } from "./query";
import { DevControls } from "./DevControls";
import { StepIndicator } from "./StepIndicator";
import { GoalStep } from "./GoalStep";
import { CheckStep } from "./CheckStep";
import { ResultView } from "./ResultView";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ContentGuideProto() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseGuideQuery(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const navigate = useCallback(
    (next: GuideQuery, mode: "push" | "replace") => {
      const url = `${pathname}${buildGuideSearch(next)}`;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  // ステップが変わったら先頭へスクロールし、見出しにフォーカスを移す（初回表示では動かさない）
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevStepKey = useRef<string | null>(null);
  const stepKey = `${query.step}:${query.goal ?? ""}`;
  useEffect(() => {
    if (prevStepKey.current !== null && prevStepKey.current !== stepKey) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      stepHeadingRef.current?.focus({ preventScroll: true });
    }
    prevStepKey.current = stepKey;
  }, [stepKey]);

  const handleSelectGoal = (goal: SkillStateId) => {
    trackContentGuide("content_guide_goal_select", {
      goal_state_id: goal,
      has_prerequisites: hasPrerequisites(goal),
      viewer: query.viewer,
    });
    navigate(
      { goal, checked: [], step: hasPrerequisites(goal) ? "check" : "result", viewer: query.viewer },
      "push"
    );
  };

  const handleChangeChecked = (checked: SkillStateId[]) => {
    navigate({ ...query, checked }, "replace");
  };

  const handleShowResult = () => navigate({ ...query, step: "result" }, "push");

  const handleRestart = () => navigate({ goal: null, checked: [], step: "goal", viewer: query.viewer }, "push");

  const handleEditChecked = () => navigate({ ...query, step: "check" }, "push");

  const handleViewer = (viewer: Viewer) => navigate({ ...query, viewer }, "replace");

  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto w-full min-w-0 max-w-[752px] px-4 py-8 sm:px-6 sm:py-12">
        <DevControls viewer={query.viewer} onViewer={handleViewer} />

        <header className="mt-6">
          <p className="text-xs font-bold tracking-wider text-text-muted">コンテンツガイド</p>
          <h1 className="mt-1 font-heading text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
            なりたいスキル状態から、最初のテーマを見つける
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            なりたい状態を1つ選ぶと、いまの自分からそこまでの道筋と、すぐ始められるレッスンがわかります。
          </p>
        </header>

        <StepIndicator
          className="mt-6"
          step={query.step}
          skipCheck={query.goal !== null && !hasPrerequisites(query.goal)}
        />

        <div className="mt-8" key={stepKey}>
          {query.step === "goal" || query.goal === null ? (
            <GoalStep headingRef={stepHeadingRef} onSelect={handleSelectGoal} />
          ) : query.step === "check" ? (
            <CheckStep
              headingRef={stepHeadingRef}
              goal={query.goal}
              checked={query.checked}
              onChange={handleChangeChecked}
              onBack={handleRestart}
              onNext={handleShowResult}
            />
          ) : (
            <ResultView
              headingRef={stepHeadingRef}
              goal={query.goal}
              checked={query.checked}
              viewer={query.viewer}
              onRestart={handleRestart}
              onEditChecked={handleEditChecked}
            />
          )}
        </div>
      </div>
    </div>
  );
}
