import { useId } from "react";
import { cn } from "@/lib/utils";

interface GradientLockIconProps {
  /** px 指定。未指定の場合はCSSのwidth/heightに追従 */
  size?: number;
  strokeWidth?: number;
  className?: string;
  title?: string;
}

/**
 * ロックアイコン（グラデーション版）
 *
 * IconCheck の "on" 状態で使っているグラデーション色に合わせるためのアイコン。
 * iconsax-react ではグラデーションstrokeが扱いづらいので、SVGを直接描画する。
 */
export function GradientLockIcon({
  size,
  strokeWidth = 2,
  className,
  title = "Locked",
}: GradientLockIconProps) {
  const reactId = useId();
  const gradientId = `lock-grad-${reactId}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,75,111,0.68)" />
          <stop offset="1" stopColor="rgba(38,119,143,0.68)" />
        </linearGradient>
      </defs>

      {/* lucide Lock (24px viewBox) と同等のパス */}
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
      />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

