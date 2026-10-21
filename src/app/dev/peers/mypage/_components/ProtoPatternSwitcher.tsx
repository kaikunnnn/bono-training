"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PATTERN_KEYS, type PatternKey } from "../../_data";

const NAMES: Record<PatternKey, string> = {
  a: "同期フィード",
  b: "いま作業中",
  c: "1歩先の人",
  d: "いつもいる人",
};

/**
 * プロト用のパターン切り替え（本物の画面には無いもの）。右下に小さく浮かせ、撮影で邪魔なら折りたためる。
 * マイページのタブ（すべて/進捗…）と紛れないよう、暗い面にして「プロト用」と明記した。
 */
export function ProtoPatternSwitcher({
  value,
  onChange,
}: {
  value: PatternKey;
  onChange: (key: PatternKey) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-40 rounded-[16px] bg-dark-section p-2 text-text-inverse shadow-[var(--shadow-popover)]">
      <div className="flex items-center justify-between gap-3 pl-1.5">
        <span className="text-[length:var(--text-2xs)] font-bold opacity-80">
          プロト用の切り替え{!open && `（いま ${value.toUpperCase()}）`}
        </span>
        <Button
          type="button"
          variant="unstyled"
          size="unstyled"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "切り替えをたたむ" : "切り替えをひらく"}
          className="flex h-7 w-7 items-center justify-center rounded-[8px] hover:bg-surface/10"
        >
          {open ? <ChevronDown aria-hidden /> : <ChevronUp aria-hidden />}
        </Button>
      </div>
      {open && (
        <div
          role="radiogroup"
          aria-label="同期ブロックのパターン（プロト用）"
          className="mt-1.5 flex gap-1"
        >
          {PATTERN_KEYS.map((key) => {
            const active = key === value;
            return (
              <Button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                variant="unstyled"
                size="unstyled"
                onClick={() => onChange(key)}
                className={cn(
                  "flex h-auto flex-col items-center rounded-[10px] px-2.5 py-1.5 leading-tight",
                  active
                    ? "bg-surface text-text-primary hover:bg-surface"
                    : "text-text-inverse/70 hover:bg-surface/10",
                )}
              >
                <span className="text-xs font-bold">{key.toUpperCase()}</span>
                <span className="text-[length:var(--text-2xs)] font-bold">
                  {NAMES[key]}
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
