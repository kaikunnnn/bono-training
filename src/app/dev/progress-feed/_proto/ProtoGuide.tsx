"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { Book } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MILESTONE_ARTICLE_SLUG,
  PROTO_BASE,
  PROTO_MYPAGE,
  PROTO_TOP,
  articleHref,
} from "./data";
import { findMyPost } from "./state";
import { useProto } from "./ProtoProvider";

const OPEN_KEY = "bono.dev.progressFeed.guideOpen";

interface Step {
  title: string;
  hint: string;
  done: boolean;
  action?: ReactNode;
}

/**
 * 右下の小さな「体験ガイド」。畳める。
 * 触る順番と、時間経過を待たずに進めるボタン（がんばろ・反応）と「最初からやり直す」を置く。
 */
export function ProtoGuide() {
  const { state, dispatch } = useProto();
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

  const myPost = findMyPost(state);
  const steps: Step[] = [
    {
      title: "マイページ（またはトップ）を開く",
      hint: "一番上の「今やっている人」で、今この時間に進めている人が見えます。",
      done: state.visitedMypage,
      action: (
        <Button asChild size="sm" variant="secondary">
          <Link href={PROTO_MYPAGE}>マイページ案を開く</Link>
        </Button>
      ),
    },
    {
      title: "「今日はこれをやる」で始める",
      hint: "進行中カードの「次👉」の横にあります。押すと「今やっている人」にあなたが加わり、記事ページへ進みます。",
      done: state.hasStarted,
      action: (
        <Button asChild size="sm" variant="secondary">
          <Link href={PROTO_MYPAGE}>進行中カードへ</Link>
        </Button>
      ),
    },
    {
      title: "「👋 がんばろ」が届く",
      hint: "始めて少しすると、ほかの学習者から「がんばろ」が届きます。",
      done: state.receivedCheerFrom !== null,
      action: state.learning ? (
        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "receiveCheer" })}>
          待たずに受け取る
        </Button>
      ) : undefined,
    },
    {
      title: "クエストの最後の記事を「完了にする」",
      hint: "「フレームとレイヤーの基本」を完了にすると、クエスト完了の演出の中で、みんなの進捗に流れたことが分かります。記事1本だけの完了では流れません。",
      done: Boolean(myPost) || state.retractedPost !== null,
      action: (
        <Button asChild size="sm" variant="secondary">
          <Link href={articleHref(MILESTONE_ARTICLE_SLUG)}>記事ページへ</Link>
        </Button>
      ),
    },
    {
      title: "時間を進めて、応援を届ける",
      hint: "しばらくすると、あなたの投稿に応援が集まり、右上のベルに通知が届きます（待たずに進められます）。",
      done: state.reactionsDelivered,
      action: myPost ? (
        <Button size="sm" onClick={() => dispatch({ type: "deliverReactions" })}>
          反応を届ける
        </Button>
      ) : (
        <p className="text-xs text-text-muted">先にクエストを完了して、投稿を流してください。</p>
      ),
    },
    {
      title: "ベルの通知から自分の投稿へ戻る",
      hint: "マイページかトップの右上「プロト用の通知」のベルを開いて、通知を押してください。マイページの「みんな」タブで、あなたの投稿が強調されます。",
      done: state.hasReturned,
    },
  ];

  const currentIndex = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const current = currentIndex >= 0 ? steps[currentIndex] : null;

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-[70]">
        <Button size="sm" onClick={() => toggle(true)} aria-expanded={false} aria-controls="proto-guide">
          <Book size={16} color="currentColor" />
          体験ガイド {doneCount}/{steps.length}
        </Button>
      </div>
    );
  }

  return (
    <aside
      id="proto-guide"
      aria-label="体験ガイド"
      className="fixed bottom-4 right-4 z-[70] w-[min(320px,calc(100vw-32px))] rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 shadow-[var(--shadow-popover)]"
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
            通しで体験できました。もう一度試すときは「最初からやり直す」を押してください。
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--card-border-subtle)] pt-3">
        <nav aria-label="プロトのページ" className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <Link href={PROTO_BASE} className="text-text-muted underline hover:text-text-primary">
            入口
          </Link>
          <Link href={PROTO_MYPAGE} className="text-text-muted underline hover:text-text-primary">
            マイページ案
          </Link>
          <Link href={PROTO_TOP} className="text-text-muted underline hover:text-text-primary">
            トップ案
          </Link>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-text-muted"
          onClick={() => dispatch({ type: "reset" })}
        >
          <RotateCcw />
          最初からやり直す
        </Button>
      </div>
    </aside>
  );
}
