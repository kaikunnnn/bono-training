"use client";

import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GUIDE_STEPS } from "../_data";

export interface GuideProgress {
  hasStarted: boolean;
  isLearning: boolean;
  receivedCheer: boolean;
  hasMyPost: boolean;
  skippedPost: boolean;
  cheeredOthers: boolean;
  reactionsDelivered: boolean;
  hasReturned: boolean;
}

interface GuidePanelProps {
  step: number;
  progress: GuideProgress;
  onStep: (step: number) => void;
  onOpenStart: () => void;
  onReceiveCheerNow: () => void;
  onFinish: () => void;
  onDeliverReactions: () => void;
  onScrollToFeed: () => void;
  onReset: () => void;
}

/** 4場面＋始めるを順に進める体験ガイド */
export function GuidePanel({
  step,
  progress: p,
  onStep,
  onOpenStart,
  onReceiveCheerNow,
  onFinish,
  onDeliverReactions,
  onScrollToFeed,
  onReset,
}: GuidePanelProps) {
  const done = [
    p.hasStarted && p.receivedCheer,
    p.hasMyPost || p.skippedPost,
    p.cheeredOthers,
    p.reactionsDelivered,
    p.hasReturned,
  ];
  const current = GUIDE_STEPS[step];

  return (
    <section
      aria-labelledby="guide-heading"
      className="rounded-[24px] border border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--shadow-board-card)]"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="guide-heading" className="font-heading text-base font-bold text-text-primary">
          体験ガイド
        </h2>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-text-muted" onClick={onReset}>
          <RotateCcw />
          最初から
        </Button>
      </div>

      {/* 場面の一覧（押すとその場面へ） */}
      <ol className="mt-3 flex flex-col gap-1">
        {GUIDE_STEPS.map((s, i) => (
          <li key={s.key}>
            <Button
              variant="unstyled"
              size="unstyled"
              onClick={() => onStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex w-full items-center justify-start gap-2.5 rounded-[10px] px-2 py-1.5 text-left text-sm font-medium",
                i === step ? "bg-muted text-text-primary" : "text-text-secondary hover:bg-[var(--bg-hover)]",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[length:var(--text-2xs)] font-bold",
                  done[i]
                    ? "bg-success text-text-inverse"
                    : i === step
                      ? "bg-cta-primary-bg text-text-inverse"
                      : "bg-muted-strong text-text-secondary",
                )}
              >
                {done[i] ? <Check className="h-3 w-3" strokeWidth={3} /> : s.label}
              </span>
              {s.title}
            </Button>
          </li>
        ))}
      </ol>

      {/* 今の場面の説明 */}
      <div className="mt-4 rounded-[16px] bg-[var(--bg-base)] p-4">
        <p className="text-xs font-bold text-text-muted">場面 {current.label}</p>
        <h3 className="mt-0.5 font-heading text-base font-bold text-text-primary">{current.title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">{current.description}</p>
        <p className="mt-3 text-xs font-bold text-text-primary">やってみること</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{current.todo}</p>

        <div className="mt-3 flex flex-col gap-2">
          <StepAction
            step={step}
            p={p}
            onOpenStart={onOpenStart}
            onReceiveCheerNow={onReceiveCheerNow}
            onFinish={onFinish}
            onDeliverReactions={onDeliverReactions}
            onScrollToFeed={onScrollToFeed}
            onReset={onReset}
          />
        </div>

        <p className="mt-3 text-[length:var(--text-2xs)] leading-relaxed text-text-muted">
          ねらう障壁: {current.barriers}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={() => onStep(step - 1)} disabled={step === 0}>
          <ChevronLeft />
          戻る
        </Button>
        <span className="text-xs text-text-muted">
          {step + 1} / {GUIDE_STEPS.length}
        </span>
        <Button size="sm" onClick={() => onStep(step + 1)} disabled={step === GUIDE_STEPS.length - 1}>
          次へ
          <ChevronRight />
        </Button>
      </div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-text-success">{children}</p>;
}

function StepAction({
  step,
  p,
  onOpenStart,
  onReceiveCheerNow,
  onFinish,
  onDeliverReactions,
  onScrollToFeed,
  onReset,
}: {
  step: number;
  p: GuideProgress;
  onOpenStart: () => void;
  onReceiveCheerNow: () => void;
  onFinish: () => void;
  onDeliverReactions: () => void;
  onScrollToFeed: () => void;
  onReset: () => void;
}) {
  switch (step) {
    case 0:
      if (!p.isLearning && !p.hasStarted)
        return (
          <Button size="sm" onClick={onOpenStart}>
            学習を始める
          </Button>
        );
      if (p.isLearning && !p.receivedCheer)
        return (
          <>
            <p className="text-xs text-text-muted">数秒すると「がんばろ」が届きます。</p>
            <Button size="sm" variant="secondary" onClick={onReceiveCheerNow}>
              待たずに受け取る
            </Button>
          </>
        );
      return <Note>始めたことが「今やっている人」に出ました。「次へ」で進めてください。</Note>;

    case 1:
      if (p.hasMyPost) return <Note>フィードの先頭にあなたの投稿が流れました。「次へ」で進めてください。</Note>;
      if (p.isLearning)
        return (
          <Button size="sm" onClick={onFinish}>
            終える
          </Button>
        );
      if (p.skippedPost)
        return (
          <>
            <p className="text-xs leading-relaxed text-text-muted">
              今回は流さなかったので、フィードには載っていません。場面3・4を試すときは、もう一度始めて「フィードに流す」を選んでください。
            </p>
            <Button size="sm" variant="secondary" onClick={onOpenStart}>
              もう一度始める
            </Button>
          </>
        );
      return (
        <Button size="sm" variant="secondary" onClick={onOpenStart}>
          先に学習を始める
        </Button>
      );

    case 2:
      return (
        <Button size="sm" variant="secondary" onClick={onScrollToFeed}>
          フィードへ移動
        </Button>
      );

    case 3:
      if (!p.hasMyPost)
        return (
          <p className="text-xs leading-relaxed text-text-muted">
            先に場面1で、あなたの投稿をフィードに流してください。
          </p>
        );
      if (!p.reactionsDelivered)
        return (
          <Button size="sm" onClick={onDeliverReactions}>
            反応を届ける
          </Button>
        );
      return <Note>右上のベルにバッジが付きました。開いて通知を確認してください。</Note>;

    case 4:
      if (p.hasReturned)
        return (
          <>
            <Note>通しで体験できました。もう一度試すときは「最初から」を押してください。</Note>
            <Button size="sm" variant="secondary" onClick={onReset}>
              最初からやり直す
            </Button>
          </>
        );
      if (!p.reactionsDelivered)
        return <p className="text-xs text-text-muted">先に場面3で反応を届けてください。</p>;
      return <p className="text-xs text-text-muted">右上のベルを開いて、通知を押してください。</p>;

    default:
      return null;
  }
}
