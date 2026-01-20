import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./icon-check.module.css";

interface IconCheckProps {
  /** 状態: empty(未完了) / on(完了) */
  status?: "empty" | "on";
  /** 完了状態（statusの代替。CheckIconとの互換性のため） */
  isCompleted?: boolean;
  /** 表示トーン（使用箇所に応じた濃さ） */
  tone?: "subtle" | "strong";
  /** 完了になった瞬間だけアニメーションする（devで調整用） */
  animateOnComplete?: boolean;
  /** 丸（背景）のポップ時間 */
  popMs?: number;
  /** チェック（線を描く）の時間 */
  drawMs?: number;
  /** カスタムクラス */
  className?: string;
}

/**
 * チェックアイコン（共通コンポーネント）
 *
 * 使用箇所:
 * - QuestHeader（クエスト番号行）
 * - 記事詳細サイドナビの記事一覧
 *
 * Note: Iconsaxには単体のチェックマークアイコンがないため、
 * このコンポーネントのみ lucide-react の Check を使用しています。
 *
 * @example
 * <IconCheck status="empty" />  // 未完了
 * <IconCheck status="on" />     // 完了
 */
export function IconCheck({
  status,
  isCompleted: isCompletedProp,
  tone = "subtle",
  animateOnComplete = false,
  popMs = 360,
  drawMs = 260,
  className,
}: IconCheckProps) {
  // isCompleted または status のどちらかで完了状態を判定
  const isCompleted = isCompletedProp ?? status === "on";
  const prevRef = useRef(isCompleted);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = isCompleted;

    if (!animateOnComplete) return;

    // 完了: false -> true の瞬間だけ
    if (!prev && isCompleted) {
      setIsAnimating(false);
      requestAnimationFrame(() => setIsAnimating(true));

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setIsAnimating(false);
      }, Math.max(popMs, drawMs) + 240);
    }
  }, [isCompleted, animateOnComplete, popMs, drawMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "size-4 rounded-full backdrop-blur-[2px] flex items-center justify-center flex-shrink-0",
        isCompleted
          ? "bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)]"
          : tone === "strong"
            ? "border border-[#020817]"
            : "border border-black/5",
        isAnimating && isCompleted && animateOnComplete ? styles.pop : undefined,
        className
      )}
      style={
        isAnimating && isCompleted && animateOnComplete
          ? ({
              ["--ic-pop-ms" as never]: `${popMs}ms`,
              ["--ic-draw-ms" as never]: `${drawMs}ms`,
            } satisfies React.CSSProperties)
          : undefined
      }
    >
      <Check
        className={cn(
          "size-2.5",
          isCompleted
            ? "text-white"
            : tone === "strong"
              ? "text-[#020817]"
              : "text-[#d5d5d5]",
          isAnimating && isCompleted && animateOnComplete ? styles.draw : undefined
        )}
        strokeWidth={2.5}
      />
    </div>
  );
}
