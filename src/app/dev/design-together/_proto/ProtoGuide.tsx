"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown, FastForward, RotateCcw } from "lucide-react";
import { Book } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADVANCE_MS, DT_BASE, DT_FEED, DT_MYPAGE, DT_SQUAD, MAIN_ARTICLE_SLUG, articleHref } from "./data";
import { useDesignTogether } from "./ProtoProvider";

const OPEN_KEY = "bono.dev.designTogether.guideOpen";

interface Step {
  title: string;
  hint: string;
  done: boolean;
  action?: ReactNode;
}

/**
 * 右下の「体験ガイド」（#251 の ProtoGuide を参考に #253 用に作り直したもの）。
 * 触る順番と、待たずに確かめるための切り替え（作業中のダミー 2人/0人・時間を進める・やり直す）を置く。
 */
export function ProtoGuide() {
  const { state, dispatch, openStart, openEnd } = useDesignTogether();
  const [open, setOpen] = useState(true);

  // 開閉はこの閲覧者の好みとしてだけ覚える（使えなければ毎回開いた状態）
  useEffect(() => {
    try {
      // マウント時に1回だけ、保存された開閉に合わせる（描画中に読むと hydration がずれる）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.sessionStorage.getItem(OPEN_KEY) === "0") setOpen(false);
    } catch {
      // 何もしない
    }
  }, []);

  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      window.sessionStorage.setItem(OPEN_KEY, next ? "1" : "0");
    } catch {
      // 何もしない
    }
  };

  const isWorking = state.mySession !== null;
  const hasStartedOnce = isWorking || state.workLogs.length > 0;
  const steps: Step[] = [
    {
      title: "マイページを開く",
      hint: "見出しのすぐ下に「いま作業中」の帯があります。作業中の人の顔が並びます（何をやっているかは出しません）。",
      done: state.visitedMypage,
      action: (
        <Button asChild size="sm" variant="secondary">
          <Link href={DT_MYPAGE}>マイページを開く</Link>
        </Button>
      ),
    },
    {
      title: "「これからデザインやります」を押す",
      hint: "帯の右のボタンです。押すと、今日やることを一言書くダイアログが開きます。",
      done: state.openedStartDialog || hasStartedOnce,
      action: !isWorking ? (
        <Button size="sm" variant="secondary" onClick={openStart}>
          ダイアログを開く
        </Button>
      ) : undefined,
    },
    {
      title: "今日やることを宣言して始める",
      hint: "一言は任意（60文字まで）。空のままでも始められます。始めると、作業中の一覧の先頭にあなたが入ります。",
      done: hasStartedOnce,
    },
    {
      title: "動画ページで作業する",
      hint: "どのページでも画面の上に「作業中 ◯分・作業を終える」が出ます。動画ページでは動画の下に出て、動画にはかかりません。",
      done: state.visitedArticleWhileWorking,
      action: (
        <Button asChild size="sm" variant="secondary">
          <Link href={articleHref(MAIN_ARTICLE_SLUG)}>動画ページへ</Link>
        </Button>
      ),
    },
    {
      title: "「作業を終える」を押す",
      hint: "本来はここから日報（次のスライス）に進みます。今は確認だけで終わり、作業の記録が残ります。",
      done: state.workLogs.some((l) => l.endReason === "manual"),
      action: isWorking ? (
        <Button size="sm" variant="secondary" onClick={openEnd}>
          作業を終える
        </Button>
      ) : undefined,
    },
  ];

  const currentIndex = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const current = currentIndex >= 0 ? steps[currentIndex] : null;
  const advancedHours = Math.round(state.timeOffsetMs / 3_600_000);

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-[70]">
        <Button size="sm" onClick={() => toggle(true)} aria-expanded={false} aria-controls="dt-guide">
          <Book size={16} color="currentColor" />
          体験ガイド {doneCount}/{steps.length}
        </Button>
      </div>
    );
  }

  return (
    <aside
      id="dt-guide"
      aria-label="体験ガイド"
      className="fixed bottom-4 right-4 z-[70] max-h-[calc(100vh-96px)] w-[min(320px,calc(100vw-32px))] overflow-y-auto rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 shadow-[var(--shadow-popover)]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-heading text-sm font-bold text-text-primary">
          <Book size={16} color="currentColor" />
          体験ガイド
          <span className="text-xs font-normal text-text-muted">
            {doneCount}/{steps.length}
          </span>
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => toggle(false)}
          aria-label="体験ガイドを畳む"
          aria-expanded
        >
          <ChevronDown />
        </Button>
      </div>

      <ol className="mt-2 flex flex-col gap-0.5">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "flex items-start gap-2 rounded-[10px] px-2 py-1 text-xs",
              i === currentIndex ? "bg-muted font-bold text-text-primary" : "text-text-secondary",
            )}
          >
            <span
              className={cn(
                "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[length:var(--text-2xs)] font-bold",
                s.done
                  ? "bg-success text-text-inverse"
                  : i === currentIndex
                    ? "bg-cta-primary-bg text-text-inverse"
                    : "bg-muted-strong text-text-secondary",
              )}
            >
              {s.done ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : i + 1}
            </span>
            {s.title}
          </li>
        ))}
      </ol>

      <div className="mt-3 rounded-[14px] bg-[var(--bg-base)] p-3">
        {current ? (
          <>
            <p className="text-xs leading-relaxed text-text-secondary">{current.hint}</p>
            {current.action && <div className="mt-2 flex flex-wrap gap-2">{current.action}</div>}
          </>
        ) : (
          <p className="text-xs leading-relaxed text-text-success">
            一通り体験できました。下の切り替えで「0人のとき」や「押し忘れ」も確かめられます。
          </p>
        )}
      </div>

      {/* 待たずに確かめるための切り替え */}
      <div className="mt-3 flex flex-col gap-2 border-t border-[var(--card-border-subtle)] pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary" id="dt-dummy-label">
            作業中のダミー
          </p>
          <div role="group" aria-labelledby="dt-dummy-label" className="inline-flex gap-1">
            {(["two", "zero"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={state.dummyMode === mode ? "default" : "secondary"}
                className="h-8 px-3 text-xs"
                aria-pressed={state.dummyMode === mode}
                onClick={() => dispatch({ type: "setDummyMode", mode, now: Date.now() + state.timeOffsetMs })}
              >
                {mode === "two" ? "2人" : "0人"}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            時間を進める
            {advancedHours > 0 && <span className="ml-1 text-text-muted">（いま +{advancedHours}時間）</span>}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={() => dispatch({ type: "advanceTime", ms: ADVANCE_MS })}
          >
            <FastForward />
            +3時間
          </Button>
        </div>
        <p className="text-[length:var(--text-2xs)] leading-relaxed text-text-muted">
          作業中に+3時間すると、押し忘れとして自動で終わり、マイページに「前回の日報を書く」が出ます。
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--card-border-subtle)] pt-3">
        <nav aria-label="プロトのページ" className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <Link href={DT_BASE} className="text-text-muted underline hover:text-text-primary">
            入口
          </Link>
          <Link href={DT_MYPAGE} className="text-text-muted underline hover:text-text-primary">
            マイページ
          </Link>
          <Link href={DT_FEED} className="text-text-muted underline hover:text-text-primary">
            フィード
          </Link>
          <Link href={DT_SQUAD} className="text-text-muted underline hover:text-text-primary">
            仲間グループ
          </Link>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-text-muted"
          onClick={() => dispatch({ type: "reset", now: Date.now() })}
        >
          <RotateCcw />
          最初からやり直す
        </Button>
      </div>
    </aside>
  );
}
