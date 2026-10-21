"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  emoji: string;
  label: string;
  count: number;
  active: boolean;
  onToggle: () => void;
  /** 反応する相手の名前（読み上げ用） */
  targetName: string;
  className?: string;
}

/**
 * 1タップの反応ボタン（全パターン共通）。押すと送った状態＋小さく弾むアニメ＋数が1増える。
 * もう一度押すと取り消し（誤タップ対策）。
 * アニメは globals.css にキーフレームを足さず Web Animations API で出し、
 * prefers-reduced-motion のときは出さない。
 */
export function ReactionButton({
  emoji,
  label,
  count,
  active,
  onToggle,
  targetName,
  className,
}: ReactionButtonProps) {
  const popRef = useRef<HTMLSpanElement>(null);

  const handleClick = () => {
    if (!active) {
      const el = popRef.current;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (el && !reduce && typeof el.animate === "function") {
        el.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.45) rotate(-8deg)" },
            { transform: "scale(0.92)" },
            { transform: "scale(1)" },
          ],
          { duration: 380, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
        );
      }
    }
    onToggle();
  };

  return (
    <Button
      type="button"
      variant="unstyled"
      size="unstyled"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={`${targetName}さんに「${label}」${active ? "を送りました（もう一度押すと取り消し）" : "を送る"}（${count}件）`}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-bold transition-colors",
        active
          ? "border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] text-text-link hover:bg-[var(--reaction-active-bg)]"
          : "border-[var(--reaction-border)] bg-surface text-text-secondary hover:bg-[var(--bg-hover)]",
        className,
      )}
    >
      <span
        ref={popRef}
        className="inline-block text-[15px] leading-none"
        aria-hidden
      >
        {emoji}
      </span>
      <span>{label}</span>
      {active && <Check className="!size-3.5" strokeWidth={3} aria-hidden />}
      <span
        className={cn(
          "min-w-5 rounded-full px-1.5 text-center text-[11px] leading-[18px] tabular-nums",
          active ? "bg-surface text-text-link" : "bg-muted text-text-primary",
        )}
      >
        {count}
      </span>
    </Button>
  );
}
