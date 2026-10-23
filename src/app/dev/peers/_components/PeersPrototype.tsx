"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BASE_COUNTS, ME, PATTERN_KEYS, type PatternKey } from "../_data";
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
 * 同期が見えるプロト（#255）。PC幅（本物のサイドナビの右の本文エリア）で、4パターンをタブで切り替える。
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
    router.replace(`?pattern=${key}`, { scroll: false });
  };

  const props: PatternProps = {
    isActive: (p, id) => Boolean(sent[`${p}:${id}`]),
    countOf: (p, id) =>
      (BASE_COUNTS[p][id] ?? 0) + (sent[`${p}:${id}`] ? 1 : 0),
    toggle: (p, id) =>
      setSent((prev) => ({ ...prev, [`${p}:${id}`]: !prev[`${p}:${id}`] })),
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-36 pt-10">
      <header>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          同期が見えるプロト
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          #255 4パターン比較。同期＝あなた（{ME.name}）と同じ{ME.startedWeek}
          にBONOを始めた8人です
        </p>
      </header>

      <div
        role="tablist"
        aria-label="見せ方のパターン"
        className="mt-6 grid grid-cols-2 gap-1 rounded-[16px] bg-muted p-1 sm:grid-cols-4"
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
                "flex h-11 items-center justify-center gap-2 rounded-[12px] px-3 text-sm font-bold transition-colors",
                active
                  ? "bg-surface text-text-primary shadow-[var(--shadow-xs)] hover:bg-surface"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  active
                    ? "bg-cta-primary-bg text-text-inverse"
                    : "bg-surface text-text-muted",
                )}
              >
                {TABS[key].letter}
              </span>
              {TABS[key].name}
            </Button>
          );
        })}
      </div>

      <div
        id="peers-panel"
        role="tabpanel"
        aria-labelledby={`peers-tab-${pattern}`}
        className="mt-8"
      >
        {pattern === "a" && <PatternA {...props} />}
        {pattern === "b" && <PatternB {...props} />}
        {pattern === "c" && <PatternC {...props} />}
        {pattern === "d" && <PatternD {...props} />}
      </div>

      <ReturnToTaskBar
        label={RETURN_LABEL[pattern]}
        open={returnOpen}
        onOpenChange={setReturnOpen}
      />
    </div>
  );
}
