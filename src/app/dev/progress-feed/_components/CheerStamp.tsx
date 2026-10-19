"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheerStampProps {
  count: number;
  active: boolean;
  onToggle: () => void;
  /** 自分の投稿には押せない */
  disabled?: boolean;
  size?: "sm" | "md";
}

/**
 * 📣応援スタンプ（1種類・1タップ）。
 * 見た目は掲示板の ReactionButtons（Figma 135:4348）に合わせている。
 * ReactionButtons は Server Action と直結しているため import せず、状態は呼び出し側で持つ。
 */
export function CheerStamp({ count, active, onToggle, disabled, size = "md" }: CheerStampProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 gap-1" : "px-[13.5px] py-[5.5px] gap-[6px]";
  return (
    <Button
      type="button"
      variant="unstyled"
      size="unstyled"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`応援スタンプ${active ? "を取り消す" : "を押す"}（${count}件）`}
      className={cn(
        "inline-flex items-center rounded-[9px] text-[12px] font-medium leading-[18px] transition",
        sizeClasses,
        active
          ? "border border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] text-text-link hover:bg-[var(--reaction-active-bg)]"
          : "border border-[var(--reaction-border)] bg-surface/90 text-muted-foreground hover:bg-[var(--bg-hover)] hover:text-foreground",
        disabled && "disabled:opacity-100 cursor-default",
      )}
    >
      <span className={cn("leading-none", size === "sm" ? "text-[12px]" : "text-[14px]")} aria-hidden>
        📣
      </span>
      <span>応援</span>
      <span
        className={cn(
          "rounded-full px-[6px] text-[11px] font-medium leading-[14.7px]",
          active ? "bg-[var(--reaction-active-bg)] text-text-link" : "bg-muted text-foreground",
        )}
      >
        {count}
      </span>
    </Button>
  );
}
