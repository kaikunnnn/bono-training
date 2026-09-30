"use client";

/**
 * 結果画面の部品: 小さなチップ、伸びる進捗バー。
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "outline";
  className?: string;
}) {
  return (
    <span
      data-cg-text="aux"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-4",
        tone === "primary" && "bg-cta-primary-bg text-text-inverse",
        tone === "muted" && "bg-muted-strong text-text-secondary",
        tone === "outline" && "border border-border-default text-text-secondary",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * 進捗バー。表示時に 0 から伸びる（reduced-motion では transition なしで最終値に切り替わる）。
 */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const target = max > 0 ? (value / max) * 100 : 0;
  const [width, setWidth] = useState(0);
  useEffect(() => {
    // reduced-motion では transition が付かないため、次のフレームで最終値にそのまま切り替わる
    const raf = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${max}ステップ中 ${value}ステップできている`}
      className="h-2 w-full overflow-hidden rounded-full bg-muted-strong"
    >
      <div
        className="h-full rounded-full bg-cta-primary-bg motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out motion-reduce:transition-none"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
