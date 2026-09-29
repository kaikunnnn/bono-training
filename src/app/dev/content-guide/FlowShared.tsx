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
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight2, Flag, Location } from "iconsax-react";
import { Loader2 } from "lucide-react";
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
  resultCardClass,
  useRedirectTo,
  useResultViewTracking,
} from "./ResultSections";
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
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(done, DIAGNOSING_MS);
    },
    [stepKey]
  );
  return { diagnosing: startedAt !== null, start };
}

export function DiagnosingScreen({ headingRef }: { headingRef: RefObject<HTMLElement | null> }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setWidth(100));
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [headingRef]);
  return (
    <section
      aria-labelledby="content-guide-diagnosing-heading"
      className={cn(resultCardClass, "flex flex-col items-center px-6 py-12 text-center sm:py-16")}
      data-screen="diagnosing"
    >
      <Loader2 aria-hidden="true" className="size-8 text-text-muted motion-safe:animate-spin" />
      <h2
        id="content-guide-diagnosing-heading"
        ref={headingRef as RefObject<HTMLHeadingElement | null>}
        tabIndex={-1}
        className="mt-4 font-heading text-xl font-bold leading-8 text-text-primary outline-none"
      >
        診断中…
      </h2>
      <p role="status" className="mt-2 text-sm text-text-secondary">
        目標までの道筋と、最初の一歩を選んでいます
      </p>
      <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted-strong" aria-hidden="true">
        <div
          className="h-full rounded-full bg-cta-primary-bg motion-safe:transition-[width] motion-safe:duration-1000 motion-safe:ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </section>
  );
}

/** 「質問 n／m」＋細い進捗 */
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
            className={cn("h-1.5 flex-1 rounded-full", i < current ? "bg-cta-primary-bg" : "bg-muted-strong")}
          />
        ))}
      </ol>
    </div>
  );
}

/** 段階ごとの できている数を、数と同じ数のマスで見せる（色だけに頼らない: 数字も併記） */
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
      <div className="mt-1.5 flex gap-0.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-[3px]",
              i < done ? "bg-cta-primary-bg" : "border border-border-default bg-surface"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 診断結果の要約（§6）: 現在地（段階別の数＋ラベル）、目指す状態、次に身につける状態、ゴールまで。
 * size="large" は B案（結果カードとして大きく）。
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
  return (
    <section
      aria-labelledby="content-guide-diagnosis-heading"
      className={cn(resultCardClass, large && "sm:p-8")}
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
      <p className="mt-1 text-xs text-text-muted">
        できている状態 {s.doneTotal}／18（チェックした状態と、その前提）
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
        {s.stages.map((st) => (
          <StageMeter key={st.id} label={st.stageLabel} done={st.done} total={st.total} />
        ))}
      </div>

      <dl className="mt-5 grid gap-3 border-t border-[var(--card-border-subtle)] pt-4 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Flag aria-hidden="true" size={18} color="currentColor" className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0">
            <dt className="text-xs text-text-muted">目指す状態</dt>
            <dd className={cn("font-bold text-text-primary", large ? "text-base leading-7" : "text-[15px] leading-6")}>
              {SHORT_TITLES[s.goal]}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Location aria-hidden="true" size={18} color="currentColor" className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0">
            <dt className="text-xs text-text-muted">次に身につけるのは</dt>
            <dd className={cn("font-bold text-text-primary", large ? "text-base leading-7" : "text-[15px] leading-6")}>
              {SHORT_TITLES[s.next]}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2">
          <ArrowRight2 aria-hidden="true" size={18} color="currentColor" className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0 flex-1">
            <dt className="text-xs text-text-muted">ゴールまで</dt>
            <dd className="text-sm text-text-primary">
              あと<span className="font-bold">{s.remainingSteps}</span>ステップ・約
              <span className="font-bold">{s.weeks}</span>週間
              <span className="text-xs text-text-muted">
                （全{s.requiredTotal}ステップ中 {s.requiredDone}つできている）
              </span>
              <span className="mt-2 block">
                <ProgressBar value={s.requiredDone} max={s.requiredTotal} label="目指す状態までの進み具合" />
              </span>
            </dd>
          </div>
        </div>
      </dl>
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
  /** 要約の前に置くもの（A案の地図） */
  before?: ReactNode;
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
  before,
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
      {before}
      <DiagnosisSummaryCard goal={goal} checked={checked} headingRef={headingRef} size={summarySize} />
      <FirstStepSection model={model} viewer={viewer} variant={variant} />
      {showMemberNotice && <MemberNotice redirectTo={redirectTo} />}
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
