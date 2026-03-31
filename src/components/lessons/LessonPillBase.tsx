import { cn } from "@/lib/utils";

/**
 * LessonPillBase
 *
 * カテゴリタブ・バッジの高さを統一するためのベーススタイルコンポーネント。
 * height固定ではなく、padding + line-height で約34pxを実現。
 *
 * @example
 * ```tsx
 * <LessonPillBase className="border border-black rounded-full">
 *   カテゴリ名
 * </LessonPillBase>
 * ```
 */

interface LessonPillBaseProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "span";
}

export default function LessonPillBase({
  children,
  className,
  as: Component = "div",
}: LessonPillBaseProps) {
  return (
    <Component
      className={cn(
        // 高さ34px相当を実現するベーススタイル
        // text-sm(14px) + py-[9px](18px) + leading-none = 約32-34px
        "inline-flex items-center justify-center",
        "py-[9px] px-3",
        "text-sm leading-none",
        "whitespace-nowrap",
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * 高さ34pxを実現するためのTailwindクラス群
 * コンポーネントを使わずクラスだけ適用したい場合用
 */
export const pillBaseClasses = "inline-flex items-center justify-center py-[9px] px-3 text-sm leading-none whitespace-nowrap";
