"use client";

/**
 * 投稿モード専用シェル（#139 スライス1）
 *
 * カード外のレイアウト（上部装飾グラデ・ヘッダー領域・プログレス・カードコンテナ）を担う。
 * カード中身は children として受け取り、State machine 側（PostFlowClient）が差し込む。
 *
 * Figma仕様: 掲示板：投稿フロー修正_Figma仕様.md（共通シェル）
 * - 色/角丸/影は DSトークン対応表のクラス/トークンのみ使用（生hex/rgb禁止）
 */

import { X } from "lucide-react";

interface PostFlowShellProps {
  /** ヘッダーの Step 表示（例: 1）。3 分割 */
  stepNumber: number;
  /** プログレス割合（0〜100）。32 / 64 / 100 */
  progress: number;
  /** ✕キャンセル押下時。done 状態では非表示にするため onCancel を渡さない */
  onCancel?: () => void;
  /** カード中身 */
  children: React.ReactNode;
}

export function PostFlowShell({
  stepNumber,
  progress,
  onCancel,
  children,
}: PostFlowShellProps) {
  const isComplete = progress >= 100;

  return (
    <div className="relative min-h-screen bg-base">
      {/* 上部装飾グラデ（DS --training-gradient トークン参照。生グラデ値は書かない） */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[148px] w-full"
        style={{ backgroundImage: "var(--training-gradient)" }}
        aria-hidden="true"
      />

      {/* コンテンツ */}
      <div className="relative mx-auto w-full max-w-[672px] px-4 py-8">
        {/* ヘッダー領域（カード外） */}
        <div className="mb-6 space-y-4">
          {/* ✕キャンセル（done 状態では非表示） */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 text-[14px] text-foreground"
            >
              <X size={16} />
              キャンセル
            </button>
          )}

          {/* 見出し */}
          <h1 className="font-rounded-mplus text-[20px] font-bold tracking-[-0.6px] text-foreground">
            投稿を作成しよう
          </h1>

          {/* プログレス行 */}
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-muted-foreground">Step {stepNumber} / 3</span>
            <span
              className={
                isComplete
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }
            >
              {progress}% 完了
            </span>
          </div>

          {/* プログレスバー */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* カードコンテナ */}
        <div className="w-full rounded-[24px] border border-border bg-surface px-6 py-8 shadow-sm sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
