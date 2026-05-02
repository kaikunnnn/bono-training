import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

/**
 * 共通ローディングスピナーコンポーネント
 */
export function LoadingSpinner({
  size = "md",
  className,
  text = "読み込み中...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      <Loader2
        className={cn(
          "animate-spin text-gray-600",
          sizeClasses[size]
        )}
      />
      <div className={cn("font-medium text-gray-700", textSizeClasses[size])}>
        {text}
      </div>
    </div>
  );
}

export default LoadingSpinner;
