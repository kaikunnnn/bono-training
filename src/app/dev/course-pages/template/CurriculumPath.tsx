"use client";

/**
 * テンプレート＝全コース共通: カリキュラム先頭の小さな道のり（sticky）— #241
 *
 * 01●─02○─03○─◆─⚑ の小型版。スクロール中はカリキュラムの上部に付いてくる。
 * 今見ているステップを IntersectionObserver で拾って強調し、点を押すとそのステップへ飛ぶ。
 * statuses を渡すと（進行中の会員）、完了／今のステップ／未着手で点の見た目を変える。
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PathMarker, type MarkerKind, type MarkerStatus } from "./path";

export interface PathItem {
  /** curriculum-step-N の N（ゴールは null） */
  stepNumber: number | null;
  kind: MarkerKind;
  label: string;
}

export default function CurriculumPath({
  items,
  statuses,
}: {
  items: PathItem[];
  /** 進行中の会員のときだけ（items と同じ並び。ゴールの分は無視） */
  statuses?: MarkerStatus[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const targets = items
      .map((item, index) => ({ index, el: item.stepNumber ? document.getElementById(`curriculum-step-${item.stepNumber}`) : null }))
      .filter((t): t is { index: number; el: HTMLElement } => Boolean(t.el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const hit = targets.find((t) => t.el === top.target);
        if (hit) setActive(hit.index);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    targets.forEach((t) => observer.observe(t.el));
    return () => observer.disconnect();
  }, [items]);

  const statusOf = (index: number, item: PathItem): MarkerStatus => {
    if (statuses) {
      if (item.kind === "finish") return statuses.every((s) => s === "done") ? "done" : "todo";
      return statuses[index] ?? "todo";
    }
    // 進捗なし: 見ているところまで塗り、今のステップを強調
    if (index < active) return "plain";
    if (index === active) return "current";
    return "todo";
  };

  return (
    <nav
      aria-label="カリキュラムの道のり"
      className="sticky top-14 z-20 -mx-4 border-b border-border-light bg-[var(--bg-base)]/95 px-4 py-2 backdrop-blur md:-mx-10 md:px-10 lg:top-0"
    >
      <ol className="relative flex">
        {/* 線は最初の点の中心から最後の点の中心まで（各点は等幅の列の中央） */}
        <span
          aria-hidden="true"
          className="absolute top-2 h-px bg-border-strong"
          style={{ left: `calc(100% / ${items.length * 2})`, right: `calc(100% / ${items.length * 2})` }}
        />
        {items.map((item, index) => {
          const isActive = index === active && item.kind !== "finish";
          const content = (
            <>
              <span className="relative">
                <PathMarker kind={item.kind} status={statusOf(index, item)} size="sm" />
              </span>
              <span
                className={cn(
                  "mt-1 whitespace-nowrap font-latin text-[9px] tracking-[0.06em] md:text-[10px]",
                  isActive ? "font-bold text-text-primary" : "text-text-muted"
                )}
              >
                {item.label}
              </span>
            </>
          );
          return (
            <li key={index} className="relative flex flex-1 flex-col items-center">
              {item.stepNumber ? (
                <a
                  href={`#curriculum-step-${item.stepNumber}`}
                  aria-current={isActive ? "step" : undefined}
                  className="flex flex-col items-center rounded-md px-1 hover:opacity-80"
                >
                  {content}
                </a>
              ) : (
                <span className="flex flex-col items-center px-1">{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
