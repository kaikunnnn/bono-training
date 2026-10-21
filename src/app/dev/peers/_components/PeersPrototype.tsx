"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BASE_COUNTS, PATTERN_KEYS, type PatternKey } from "../_data";
import {
  PatternA,
  PatternB,
  PatternC,
  PatternD,
  type PatternProps,
} from "./patterns";
import { ReturnToTaskBar } from "./ReturnToTaskBar";

const TABS: Record<PatternKey, { letter: string; name: string }> = {
  a: { letter: "A", name: "同期フィード" },
  b: { letter: "B", name: "いま作業中" },
  c: { letter: "C", name: "1歩先の人" },
  d: { letter: "D", name: "いつもいる人" },
};

const RETURN_LABEL: Record<PatternKey, string> = {
  a: "課題に戻る",
  b: "自分も作業にもどる",
  c: "課題に戻る",
  d: "課題に戻る",
};

/**
 * 同期が見えるプロト（#255）。1ページで4パターンをタブで切り替える。
 * 反応の状態は画面の中だけ（リロードで初期化）。パターンを切り替えても押した状態は残る。
 */
export function PeersPrototype({
  initialPattern,
}: {
  initialPattern: PatternKey;
}) {
  const router = useRouter();
  const [pattern, setPattern] = useState<PatternKey>(initialPattern);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [returnOpen, setReturnOpen] = useState(false);

  const selectPattern = (key: PatternKey) => {
    setPattern(key);
    setReturnOpen(false);
    router.replace(`?pattern=${key}`, { scroll: false });
  };

  const props: PatternProps = {
    isActive: (p, id) => Boolean(sent[`${p}:${id}`]),
    countOf: (p, id) =>
      (BASE_COUNTS[p][id] ?? 0) + (sent[`${p}:${id}`] ? 1 : 0),
    toggle: (p, id) =>
      setSent((prev) => ({ ...prev, [`${p}:${id}`]: !prev[`${p}:${id}`] })),
  };

  const closeReturn = useCallback(() => setReturnOpen(false), []);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[390px] flex-col bg-base lg:min-h-dvh lg:border-x lg:border-[var(--card-border-subtle)]">
      <div className="sticky top-14 z-30 border-b border-[var(--card-border-subtle)] bg-base/95 px-3 pb-2.5 pt-2 backdrop-blur-sm lg:top-0">
        <h1 className="px-1 pb-1.5 text-[length:var(--text-2xs)] font-bold text-text-muted">
          同期が見えるプロト（4パターン比較・#255）
        </h1>
        <div
          role="tablist"
          aria-label="見せ方のパターン"
          className="grid grid-cols-4 gap-1 rounded-[14px] bg-muted p-1"
        >
          {PATTERN_KEYS.map((key) => {
            const active = key === pattern;
            return (
              <Button
                key={key}
                type="button"
                role="tab"
                id={`peers-tab-${key}`}
                aria-selected={active}
                aria-controls="peers-panel"
                variant="unstyled"
                size="unstyled"
                onClick={() => selectPattern(key)}
                className={cn(
                  "flex h-auto flex-col items-center gap-0 whitespace-normal rounded-[10px] px-1 py-1.5 text-center leading-tight transition-colors",
                  active
                    ? "bg-surface text-text-primary shadow-[var(--shadow-xs)]"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                <span className="text-xs font-bold">{TABS[key].letter}</span>
                <span className="text-[length:var(--text-2xs)] font-bold">
                  {TABS[key].name}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div
        id="peers-panel"
        role="tabpanel"
        aria-labelledby={`peers-tab-${pattern}`}
        className="flex-1"
      >
        {pattern === "a" && <PatternA {...props} />}
        {pattern === "b" && <PatternB {...props} />}
        {pattern === "c" && <PatternC {...props} />}
        {pattern === "d" && <PatternD {...props} />}
      </div>

      <ReturnToTaskBar
        label={RETURN_LABEL[pattern]}
        open={returnOpen}
        onOpen={() => setReturnOpen(true)}
        onClose={closeReturn}
      />
    </div>
  );
}
