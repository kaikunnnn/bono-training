import { cn } from "@/lib/utils";

interface DottedDividerProps {
  /** ドットサイズ: "sm" (2px) or "md" (3px) */
  size?: "sm" | "md";
  /** ドットの色 */
  color?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ドット区切り線コンポーネント
 *
 * セクション間の区切りに使用する丸ドットのボーダー
 * radial-gradient で軽量に実装
 *
 * @example
 * ```tsx
 * <DottedDivider />                    // デフォルト: 2px dots (border-default色)
 * <DottedDivider size="md" />          // 3px dots（強め）
 * <DottedDivider color="#9CA3AF" />    // カスタム色
 * ```
 */
export default function DottedDivider({
  size = "sm",
  color = "#C3C5BB", // --border-default
  className,
}: DottedDividerProps) {
  const dotSize = size === "sm" ? 2 : 3;
  const gap = 6;
  const spacing = dotSize + gap;

  return (
    <div
      className={cn("w-full", className)}
      style={{
        height: dotSize,
        backgroundImage: `radial-gradient(circle, ${color} ${dotSize / 2}px, transparent ${dotSize / 2}px)`,
        backgroundSize: `${spacing}px ${dotSize}px`,
        backgroundPosition: "center",
      }}
      role="separator"
      aria-hidden="true"
    />
  );
}
