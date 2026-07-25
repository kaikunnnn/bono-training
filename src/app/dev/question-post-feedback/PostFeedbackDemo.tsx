"use client";

/**
 * #137-A のBefore/Afterデモ。
 * 実際の実装:
 * - After のボタン: src/components/questions/PostQuestionButton.tsx（useTransition + スピナー）
 * - After のスケルトン: src/app/questions/new/loading.tsx
 * どちらも同じ擬似待ち時間（クリック→600ms でページ切替開始→1800ms で表示完了）で再現する。
 */

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewQuestionLoading from "@/app/questions/new/loading";

// クリック → サーバー応答（ページ切替開始）までの擬似時間
const RESPONSE_MS = 600;
// クリック → ページ表示完了までの擬似時間
const COMPLETE_MS = 1800;

type Phase = "idle" | "pending" | "loading" | "done";

function useDemoPhases() {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    if (phase !== "idle") return;
    setPhase("pending");
    timers.current.push(setTimeout(() => setPhase("loading"), RESPONSE_MS));
    timers.current.push(setTimeout(() => setPhase("done"), COMPLETE_MS));
  };
  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("idle");
  };
  return { phase, run, reset };
}

function DonePanel() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-green-200 bg-green-50/60">
      <p className="text-sm text-green-800 font-noto-sans-jp">
        ✅ /questions/new（投稿フォーム）が表示された想定
      </p>
    </div>
  );
}

function IdlePanel({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
      <p className="text-sm text-text-primary/40 font-noto-sans-jp">{label}</p>
    </div>
  );
}

/** loading.tsx のスケルトンを枠内に収めて表示する */
function SkeletonPreview() {
  return (
    <div className="h-[240px] overflow-hidden rounded-xl border border-gray-200 bg-white [&_.container]:!py-4">
      <div className="origin-top scale-[0.55]">
        <NewQuestionLoading />
      </div>
    </div>
  );
}

export function PostFeedbackDemo() {
  const before = useDemoPhases();
  const after = useDemoPhases();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ===== Before ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-noto-sans-jp">
            Before（旧実装）
          </span>
          <span className="text-xs text-text-primary/50 font-noto-sans-jp">
            押しても無反応のまま → いきなり画面が変わる
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 旧実装: pending中も見た目が一切変わらない */}
          <Button onClick={before.run}>
            <Plus className="mr-1 h-4 w-4" />
            質問を投稿する
          </Button>
          <Button variant="ghost" size="sm" onClick={before.reset}>
            <RotateCcw className="mr-1 h-3 w-3" />
            リセット
          </Button>
        </div>

        {before.phase === "done" ? (
          <DonePanel />
        ) : (
          <IdlePanel
            label={
              before.phase === "idle"
                ? "ボタンを押してみる"
                : "……無反応（サーバー処理待ち。ここが不安だった）"
            }
          />
        )}
      </section>

      {/* ===== After ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-noto-sans-jp">
            After（新実装）
          </span>
          <span className="text-xs text-text-primary/50 font-noto-sans-jp">
            ①即スピナー → ②スケルトンに切替
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 新実装: PostQuestionButton と同じ pending 表示 */}
          <Button onClick={after.run} disabled={after.phase === "pending"}>
            {after.phase === "pending" ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1 h-4 w-4" />
            )}
            質問を投稿する
          </Button>
          <Button variant="ghost" size="sm" onClick={after.reset}>
            <RotateCcw className="mr-1 h-3 w-3" />
            リセット
          </Button>
        </div>

        {after.phase === "done" ? (
          <DonePanel />
        ) : after.phase === "loading" ? (
          <SkeletonPreview />
        ) : (
          <IdlePanel
            label={
              after.phase === "idle"
                ? "ボタンを押してみる"
                : "ボタンにスピナー表示中…"
            }
          />
        )}
      </section>
    </div>
  );
}
