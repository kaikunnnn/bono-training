"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PatternKey } from "../_state";

const PATTERNS: { key: PatternKey; name: string; note: string; ready: boolean }[] = [
  { key: "A", name: "A 自動で流れる型", note: "終えると自動で流れる・スタンプ1タップ", ready: true },
  { key: "B", name: "B 進捗日記型", note: "ひとこと＋画像を自分で投稿", ready: false },
  { key: "C", name: "C 同じコンテンツの仲間型", note: "コンテンツページの中で見える", ready: false },
];

interface PatternSwitcherProps {
  value: PatternKey;
  onChange: (key: PatternKey) => void;
}

/** パターン切り替え（今回はAのみ。B・Cは準備中で押せない） */
export function PatternSwitcher({ value, onChange }: PatternSwitcherProps) {
  return (
    <div role="radiogroup" aria-label="パターン" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {PATTERNS.map((p) => {
        const active = value === p.key;
        return (
          <Button
            key={p.key}
            type="button"
            role="radio"
            aria-checked={active}
            variant="unstyled"
            size="unstyled"
            disabled={!p.ready}
            onClick={() => onChange(p.key)}
            className={cn(
              "flex h-auto flex-col items-start gap-0.5 whitespace-normal rounded-[16px] border px-4 py-3 text-left",
              active
                ? "border-cta-primary-bg bg-surface shadow-[var(--shadow-board-card)]"
                : "border-[var(--card-border-subtle)] bg-surface/60",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
              {p.name}
              {!p.ready && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[length:var(--text-2xs)] font-medium text-text-muted">
                  準備中
                </span>
              )}
            </span>
            <span className="text-xs font-normal text-text-secondary">{p.note}</span>
          </Button>
        );
      })}
    </div>
  );
}
