"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDesignTogether } from "./ProtoProvider";

/**
 * 作業中の小さな帯「作業中 ◯分 ・ 作業を終える」（機能A）。
 *
 * - floating: マイページ・フィード等。画面上部の中央（PCはサイドナビを除いた本文の中央、
 *   モバイルは本物の固定ヘッダー h-14 の下）
 * - inline: 動画ページ。動画の下・見出しの上に置き、sticky でスクロールしても見える。
 *   動画が画面外に出てから上に貼り付くので、動画には重ならない
 */
export function WorkingBar({ variant }: { variant: "floating" | "inline" }) {
  const { state, elapsedMinutes, openEnd } = useDesignTogether();
  if (!state.mySession) return null;

  const pill = (
    <div
      role="status"
      aria-label="作業中"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border-subtle)] bg-surface py-1 pl-3 pr-1 text-xs text-text-secondary shadow-[var(--shadow-popover)]"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="whitespace-nowrap">
        <span className="font-bold text-text-primary">作業中</span>
        {elapsedMinutes !== null && <span className="ml-1 tabular-nums">{elapsedMinutes}分</span>}
      </span>
      <span aria-hidden className="text-text-muted">
        ・
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 rounded-full px-2.5 text-xs text-text-primary"
        onClick={openEnd}
      >
        作業を終える
      </Button>
    </div>
  );

  if (variant === "inline") {
    return <div className="sticky top-3 z-10 flex">{pill}</div>;
  }

  return (
    <div
      className={cn(
        "fixed z-40 top-[64px] left-1/2 -translate-x-1/2",
        "lg:top-3 lg:left-[calc(50%+100px)]",
      )}
    >
      {pill}
    </div>
  );
}
