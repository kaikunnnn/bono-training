"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconCheckProps {
  status?: "empty" | "on";
  isCompleted?: boolean;
  tone?: "subtle" | "strong";
  animateOnComplete?: boolean;
  popMs?: number;
  drawMs?: number;
  className?: string;
}

export function IconCheck({
  status,
  isCompleted: isCompletedProp,
  tone = "subtle",
  className,
}: IconCheckProps) {
  const isCompleted = isCompletedProp ?? status === "on";

  return (
    <div
      className={cn(
        "size-4 rounded-full backdrop-blur-[2px] flex items-center justify-center flex-shrink-0",
        isCompleted
          ? "bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)]"
          : tone === "strong"
            ? "border border-[#020817]"
            : "border border-black/5",
        className
      )}
    >
      <Check
        className={cn(
          "size-2.5",
          isCompleted
            ? "text-white"
            : tone === "strong"
              ? "text-[#020817]"
              : "text-[#d5d5d5]"
        )}
        strokeWidth={2.5}
      />
    </div>
  );
}

export default IconCheck;
