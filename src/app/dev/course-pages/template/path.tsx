/**
 * テンプレート＝全コース共通: 道のりの点と目盛り — #241
 *
 * - PathMarker: 道のりの点（ステップ●／チャレンジ◆／ゴール⚑）
 *   status: plain=進捗なしの通常表示 / done=完了（塗り＋✓）/ current=今いるところ（強調リング）/ todo=未着手（白抜き）
 */

import { Check } from "lucide-react";
import { Flag } from "iconsax-react";
import { cn } from "@/lib/utils";

export type MarkerStatus = "plain" | "done" | "current" | "todo";
export type MarkerKind = "goal" | "challenge" | "finish";

export function PathMarker({
  kind,
  status = "plain",
  size = "md",
}: {
  kind: MarkerKind;
  status?: MarkerStatus;
  size?: "md" | "sm";
}) {
  const md = size === "md";
  if (kind === "finish") {
    return (
      <span className={cn("flex items-center justify-center text-text-primary", md ? "size-5" : "size-4")}>
        <Flag size={md ? 20 : 16} color="currentColor" variant={status === "todo" ? "Linear" : "Bold"} />
      </span>
    );
  }

  const diamond = kind === "challenge";
  const filled = status === "plain" || status === "done";
  const dotSize = md ? (status === "done" ? "size-5" : "size-3.5") : status === "done" ? "size-4" : "size-3";

  return (
    <span className={cn("flex items-center justify-center", md ? "size-5" : "size-4")}>
      <span
        className={cn(
          "flex items-center justify-center ring-4 ring-[var(--bg-base)]",
          dotSize,
          diamond ? "rotate-45 rounded-[2px]" : "rounded-full",
          filled &&
            (diamond ? "bg-[image:var(--persona-cta-gradient)]" : "bg-text-primary"),
          status === "current" &&
            "border-[3px] border-text-primary bg-[var(--bg-base)] outline outline-2 outline-offset-[3px] outline-text-primary/25",
          status === "todo" && "border-2 border-border-strong bg-[var(--bg-base)]"
        )}
      >
        {status === "done" ? (
          <Check
            size={md ? 12 : 10}
            strokeWidth={3.5}
            className={cn("text-text-inverse", diamond && "-rotate-45")}
          />
        ) : null}
      </span>
    </span>
  );
}

/** 細い進捗バー */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("block h-1 overflow-hidden rounded-full bg-border-light", className)}>
      <span
        className="block h-full rounded-full bg-text-primary"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </span>
  );
}

/** 「いまここ 2/5（1つ完了）」の形。done = 終えた区切りの数 */
export function hereLabel(done: number, total: number): string {
  if (done >= total) return `いまここ ${total}/${total}（すべて完了）`;
  return `いまここ ${done + 1}/${total}（${done}つ完了）`;
}
