"use client";

/**
 * A案・B案で共通の部品（12_診断UI_A案B案_仕様書 §4・§5・§6）。
 *
 * - useFlow: URL クエリ（flow-query.ts）の読み書き。質問の前進は push（ブラウザの戻るで1つ前へ）、チェックは replace。
 * - useStepFocus: 画面が変わったら先頭へスクロールし、見出しにフォーカス（現行の ContentGuideProto と同じ）。
 * - useDiagnosing / DiagnosingScreen: 「診断中…」（約1.2秒）。URL には持たない。prefers-reduced-motion では省略。
 * - QuestionProgress: 「質問 n／m」。
 * - DiagnosisSummaryCard: 診断結果の要約（現在地・目指す状態・次に身につける状態・ゴールまで）。
 * - FlowResult: 要約 + 最初の一歩 + 会員案内 + 道筋 + やり直し + モバイル固定ボタン（ResultSections を再利用）。
 *
 * 夜明けの表現（13_夜明けデザイン仕様書）: 文字はすべて不透明なカードの上。勇気づけのコピーは §5 の原則
 * （できていること＝光／ゼロでも肯定／未達は「まだ」／目標は「行き先」／否定語を使わない）。
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Location, Routing, Star1, Sun1 } from "iconsax-react";
import type { SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES } from "@/lib/content-guide/display";
import { isMemberHeavy } from "@/lib/content-guide/lesson-map";
import { computeSummary } from "@/lib/content-guide/summary";
import { cn } from "@/lib/utils";
import { MemberNotice } from "./MemberNotice";
import { ProgressBar } from "./ResultParts";
import {
  FirstStepSection,
  PathSection,
  RestartActions,
  StickyStartBar,
  computeResultModel,
  useRedirectTo,
  useResultViewTracking,
} from "./ResultSections";
import { DAWN_PANEL, SunriseArt } from "./Dawn";
import { buildFlowSearch, parseFlowQuery, type FlowQuery, type Variant } from "./flow-query";
import type { Viewer } from "./query";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useFlow(variant: Exclude<Variant, "list">) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseFlowQuery(new URLSearchParams(searchParams.toString()), variant),
    [searchParams, variant]
  );
  const navigate = useCallback(
    (next: FlowQuery, mode: "push" | "replace" = "push") => {
      const url = `${pathname}${buildFlowSearch(next)}`;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router]
  );
  return { query, navigate };
}

/** 画面（stepKey）が変わったら先頭へスクロールし、見出しにフォーカスを移す（初回表示では動かさない） */
export function useStepFocus(stepKey: string) {
  const headingRef = useRef<HTMLElement>(null);
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (prev.current !== null && prev.current !== stepKey) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      headingRef.current?.focus({ preventScroll: true });
    }
    prev.current = stepKey;
  }, [stepKey]);
  return headingRef;
}

export const DIAGNOSING_MS = 1200;

/**
 * 「診断中…」。start(done) で約1.2秒の表示のあと done()（結果へ push）。reduced-motion では即 done()。
 * 画面（stepKey）が変わったら表示を消す（結果へ進めば消え、ブラウザの戻るで「診断中」に止まらない）。
 * 消すのは render 中の state 調整（React の「props の変化で state をリセットする」パターン）で行う。
 */
export function useDiagnosing(stepKey: string) {
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [prevKey, setPrevKey] = useState(stepKey);
  if (prevKey !== stepKey) {
    setPrevKey(stepKey);
    setStartedAt(null);
  }
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const start = useCallback(
    (done: () => void) => {
      if (prefersReducedMotion()) {
        done();
        return;
      }
      setStartedAt(stepKey);
      // 「診断中」は短い画面なので、先頭に戻して見えるようにする
      window.scrollTo({ top: 0, behavior: "auto" });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(done, DIAGNOSING_MS);
    },
    [stepKey]
  );
  return { diagnosing: startedAt !== null, start };
}

export function DiagnosingScreen({ headingRef }: { headingRef: RefObject<HTMLElement | null> }) {
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [headingRef]);
  return (
    <section
      aria-labelledby="content-guide-diagnosing-heading"
      className={cn(DAWN_PANEL, "flex flex-col items-center px-6 py-10 text-center sm:py-12")}
      data-screen="diagnosing"
    >
      <SunriseArt />
      <h2
        id="content-guide-diagnosing-heading"
        ref={headingRef as RefObject<HTMLHeadingElement | null>}
        tabIndex={-1}
        className="mt-4 font-heading text-xl font-bold leading-8 text-text-primary outline-none"
      >
        診断中…
      </h2>
      <p role="status" className="mt-2 text-sm text-text-secondary">
        あなたの夜明けを、見える形にしています
      </p>
    </section>
  );
}

/** 「質問 n／m」＋細い進捗（A案。空の上ではなくカードの中に置く） */
export function QuestionProgress({ current, total, className }: { current: number; total: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <p className="shrink-0 text-xs font-bold text-text-secondary">
        質問 <span className="font-latin">{current}</span>／<span className="font-latin">{total}</span>
      </p>
      <ol className="flex flex-1 gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i < current ? "bg-[var(--dawn-sunrise)]" : "bg-muted-strong")}
          />
        ))}
      </ol>
    </div>
  );
}

/** 段階ごとの灯っている数を、数と同じ数の星で見せる（色だけに頼らない: 数字も併記） */
function StageMeter({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <div className="min-w-0">
      <p className="flex items-baseline justify-between gap-2 text-xs text-text-secondary">
        <span className="font-bold">{label}</span>
        <span>
          <span className="font-latin text-sm font-bold text-text-primary">{done}</span>
          <span className="font-latin">/{total}</span>
        </span>
      </p>
      <div className="mt-1.5 flex flex-wrap gap-0.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <Star1
            key={i}
            size={14}
            color="currentColor"
            variant={i < done ? "Bold" : "Linear"}
            className={i < done ? "text-[var(--dawn-sun)]" : "text-text-muted"}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 診断結果の要約（12_ §6 / 13_ §5）: 現在地（夜明けの言葉）、行き先、ゴールまで（進み具合）、次に身につけること、
 * 補助として段階別の灯っている数。モバイルのファーストビューに「行き先・進み具合」が入る順に並べる。
 * size="large" は B案（結果カードとして大きく）。表示時に光が広がってから現れる（motion-safe）。
 */
export function DiagnosisSummaryCard({
  goal,
  checked,
  headingRef,
  size = "default",
}: {
  goal: SkillStateId;
  checked: SkillStateId[];
  headingRef?: RefObject<HTMLElement | null>;
  size?: "default" | "large";
}) {
  const s = computeSummary(goal, checked);
  const large = size === "large";
  const cheer =
    s.requiredDone > 0
      ? `もう ${s.requiredDone} 個、光が灯っています。ここから、もっと明るくなります。`
      : "ここから、いちばんきれいな夜明けが始まります。";
  return (
    <section
      aria-labelledby="content-guide-diagnosis-heading"
      className={cn(
        DAWN_PANEL,
        large && "sm:p-8",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700"
      )}
      data-summary-label={s.label}
    >
      <h2
        id="content-guide-diagnosis-heading"
        ref={headingRef as RefObject<HTMLHeadingElement | null>}
        tabIndex={-1}
        className="outline-none"
      >
        <span className="block text-xs font-bold text-text-muted">診断結果・あなたの現在地</span>
        <span
          className={cn(
            "mt-1 block font-heading font-bold text-text-primary",
            large ? "text-2xl leading-9 sm:text-3xl sm:leading-10" : "text-xl leading-8 sm:text-2xl"
          )}
        >
          {s.label}
        </span>
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-text-secondary">{cheer}</p>

      <dl className="mt-4 space-y-3">
        <div className="flex items-start gap-2">
          <Sun1 aria-hidden="true" size={20} color="currentColor" variant="Bold" className="mt-0.5 shrink-0 text-[var(--dawn-sun)]" />
          <div className="min-w-0 flex-1">
            <dt className="text-xs text-text-muted">行き先（目指す状態）</dt>
            <dd className={cn("font-bold text-text-primary", large ? "text-lg leading-7" : "text-base leading-7")}>
              {SHORT_TITLES[s.goal]}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Routing aria-hidden="true" size={20} color="currentColor" className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0 flex-1">
            <dt className="text-xs text-text-muted">ゴールまで</dt>
            <dd className="text-sm text-text-primary">
              あと<span className="font-bold">{s.remainingSteps}</span>ステップ・約
              <span className="font-bold">{s.weeks}</span>週間で見える景色
              <span className="mt-2 block">
                <ProgressBar value={s.requiredDone} max={s.requiredTotal} label="行き先までの進み具合" />
              </span>
              <span className="mt-1 block text-xs text-text-muted">
                全{s.requiredTotal}ステップのうち、灯っている光 {s.requiredDone}
              </span>
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Location aria-hidden="true" size={20} color="currentColor" className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0 flex-1">
            <dt className="text-xs text-text-muted">次に身につけるのは</dt>
            <dd className="text-[15px] font-bold leading-6 text-text-primary">{SHORT_TITLES[s.next]}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 border-t border-[var(--card-border-subtle)] pt-4">
        <p className="mb-2 text-xs font-bold text-text-muted">灯っている光（段階別・18個のうち {s.doneTotal}）</p>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {s.stages.map((st) => (
            <StageMeter key={st.id} label={st.stageLabel} done={st.done} total={st.total} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FlowResultProps {
  goal: SkillStateId;
  checked: SkillStateId[];
  viewer: Viewer;
  variant: Exclude<Variant, "list">;
  headingRef?: RefObject<HTMLElement | null>;
  summarySize?: "default" | "large";
  /** 「最初の一歩」（と会員案内）のあと、道筋の前に置くもの（A案の塗られた地図） */
  afterFirstStep?: ReactNode;
  onRestart: () => void;
  onEditChecked: () => void;
}

export function FlowResult({
  goal,
  checked,
  viewer,
  variant,
  headingRef,
  summarySize,
  afterFirstStep,
  onRestart,
  onEditChecked,
}: FlowResultProps) {
  const redirectTo = useRedirectTo();
  const model = computeResultModel(goal, checked);
  const showMemberNotice =
    viewer === "guest" && model.entryLesson !== undefined && isMemberHeavy(model.entryLesson);
  useResultViewTracking(model, viewer, variant);

  return (
    <div className="space-y-5 pb-28 md:pb-0" data-screen="result">
      <DiagnosisSummaryCard goal={goal} checked={checked} headingRef={headingRef} size={summarySize} />
      <FirstStepSection
        model={model}
        viewer={viewer}
        variant={variant}
        encouragement={
          model.firstIsGoal
            ? "行き先に、もう手が届きます。この一歩から、朝が始まります。"
            : "ここが、あなたの夜明けの最初の一歩です。"
        }
      />
      {showMemberNotice && <MemberNotice redirectTo={redirectTo} />}
      {afterFirstStep}
      {model.total > 1 && <PathSection model={model} viewer={viewer} variant={variant} />}
      <RestartActions
        goal={goal}
        onEditChecked={onEditChecked}
        onRestart={onRestart}
        editLabel="できることを答え直す"
        restartLabel="最初から診断し直す"
      />
      <StickyStartBar model={model} viewer={viewer} variant={variant} />
    </div>
  );
}
