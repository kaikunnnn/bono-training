"use client";

import { Timer1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialAvatar } from "../../progress-feed/_components/InitialAvatar";
import { ME_ID, findMember } from "./data";
import { workingIds } from "./state";
import { useDesignTogether } from "./ProtoProvider";

/** 帯に顔を並べる上限（それ以上は「ほか◯人」） */
const MAX_FACES = 6;

/**
 * マイページの見出しのすぐ下に置く「いま作業中」の帯（機能A）。
 * 作業中の人の顔とニックネームだけを出す（今やっているコンテンツ名は出さない）。
 * 0人のときは「あなたも作業しよう」と大きな開始ボタンにする。
 */
export function WorkingNowBand() {
  const { state, hydrated, elapsedMinutes, openStart, openEnd } = useDesignTogether();

  // 読み込み前は人数が決まらないので、同じ高さの枠だけ出す（0人の表示が一瞬出ないように）
  if (!hydrated) {
    return (
      <section aria-label="いま作業中" className="rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 sm:px-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-10 w-full" />
      </section>
    );
  }

  const ids = workingIds(state);
  const isWorking = state.mySession !== null;
  const faces = ids.slice(0, MAX_FACES);
  const rest = ids.length - faces.length;

  if (ids.length === 0) {
    return (
      <section
        aria-labelledby="working-now-heading"
        className="flex flex-col items-start gap-4 rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="min-w-0">
          <h2 id="working-now-heading" className="font-heading text-base font-bold text-text-primary">
            いま作業中の人はいません
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            あなたが今日の1人目になりませんか。始めると、ほかの人のこの画面にあなたの顔が並びます。
          </p>
        </div>
        <Button size="lg" className="w-full shrink-0 sm:w-auto" onClick={openStart}>
          <Timer1 size={18} color="currentColor" />
          これからデザインやります
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="working-now-heading"
      className="flex flex-col gap-3 rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 sm:px-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <h2 id="working-now-heading" className="font-heading text-sm font-bold text-text-primary">
            いま作業中
          </h2>
          <span className="text-xs text-text-secondary" aria-live="polite">
            いま{ids.length}人が作業中
          </span>
        </div>

        {isWorking ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">
              <span className="font-bold text-text-primary">あなたも作業中</span>
              {elapsedMinutes !== null && <span className="tabular-nums">・{elapsedMinutes}分</span>}
            </span>
            <Button size="sm" variant="secondary" className="h-8 px-3 text-xs" onClick={openEnd}>
              作業を終える
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={openStart}>
            <Timer1 size={16} color="currentColor" />
            これからデザインやります
          </Button>
        )}
      </div>

      <ul aria-label="作業中の人" className="flex flex-wrap items-center gap-x-1 gap-y-2 sm:gap-x-4">
        {faces.map((id) => {
          const person = findMember(id);
          const isMe = id === ME_ID;
          return (
            <li
              key={id}
              className="flex items-center gap-1.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-300"
            >
              <InitialAvatar person={person} size="sm" className={isMe ? "ring-2 ring-success ring-offset-1" : undefined} />
              <span className="sr-only text-xs font-medium text-text-primary sm:not-sr-only">
                {isMe ? "あなた" : `${person.name}さん`}
              </span>
            </li>
          );
        })}
        {rest > 0 && <li className="text-xs text-text-muted">ほか{rest}人</li>}
      </ul>
    </section>
  );
}
