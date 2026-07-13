"use client";

/**
 * /dev/post-complete-animation — 完了アニメ（StepDone）の再生確認（#146 T22）
 *
 * StepDone（チェック描画→白フラッシュ→花吹雪→ARIGATO→残りフェードイン）を
 * プレビュー用（isPreview）で表示し、「リプレイ」で何度でも再生できるよう
 * key を変えて StepDone を再マウントする。
 *
 * タイミング調整の目安として主要タイミング定数を画面上に表記する
 * （値の変更UIは持たない。定数の実体は各コンポーネント側が唯一の正）。
 */

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepDone } from "@/components/questions/post-flow/StepDone";

// StepDone.tsx / Confetti.tsx の定数を参照用に転記（表示のみ・調整の目安）。
// 変更の唯一の正は各コンポーネント側の定数なので、ここは説明用のミラー。
const TIMINGS: { label: string; valueMs: number; note: string }[] = [
  { label: "チェック描画", valueMs: 280, note: "丸サークル出現後、チェックパスを描き始める（StepDone.module.css step-done-check delay）" },
  { label: "白フラッシュ", valueMs: 380, note: "チェック描画中に白い閃光を重ねる（step-done-flash の立ち上がり ~380ms）" },
  { label: "花吹雪開始", valueMs: 500, note: "フラッシュのピークに同期して花吹雪バースト（Confetti BURST_DELAY_MS）" },
  { label: "ARIGATO開始", valueMs: 650, note: "1文字ずつ左から出現（StepDone CHARS_START_MS、以降 70ms/文字）" },
];

export function PostCompleteAnimationDemo() {
  // key を変えて StepDone を再マウント → アニメを頭から再生
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="space-y-8">
      {/* リプレイ操作 */}
      <div className="flex items-center gap-3">
        <Button onClick={() => setReplayKey((k) => k + 1)}>
          <RotateCcw className="mr-1 h-4 w-4" />
          リプレイ
        </Button>
        <span className="text-sm text-text-primary/50 font-noto-sans-jp">
          押すたびに完了アニメを頭から再生します
        </span>
      </div>

      {/* 主要タイミング定数（調整の目安・表示のみ） */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-bold text-text-primary/60 font-noto-sans-jp">
          主要タイミング（マウントからの経過ms）
        </p>
        <ul className="space-y-2">
          {TIMINGS.map((t) => (
            <li key={t.label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="min-w-[8rem] text-sm font-bold text-text-primary font-noto-sans-jp">
                {t.label}
              </span>
              <span className="min-w-[4rem] text-sm tabular-nums text-text-primary/70 font-noto-sans-jp">
                {t.valueMs}ms
              </span>
              <span className="text-xs text-text-primary/50 font-noto-sans-jp">
                {t.note}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 実カード相当のコンテナに StepDone を差し込む（PostFlowShell のカードと同じ見た目） */}
      <div className="mx-auto w-full max-w-[672px]">
        <div className="w-full rounded-[24px] border border-border bg-surface px-6 py-8 shadow-sm sm:px-10">
          {/* key を変えて再マウント。isPreview で slug 無しでも一覧へフォールバック */}
          <StepDone key={replayKey} isPreview />
        </div>
      </div>
    </div>
  );
}
