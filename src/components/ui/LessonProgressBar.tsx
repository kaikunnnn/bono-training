import { cn } from "@/lib/utils";

interface LessonProgressBarProps {
  /** 進捗率 0-100 */
  progress: number;
  /** パーセント表示の有無（デフォルト: true） */
  showPercent?: boolean;
  /** 幅指定（デフォルト: 100%） */
  width?: string | number;
  /** カスタムクラス */
  className?: string;
}

/**
 * レッスン進捗バー（共通コンポーネント）
 *
 * 使用箇所:
 * - マイページ（ProgressLesson）
 * - 記事サイドバー（LessonDetailCard）
 * - レッスン詳細（LessonTitleArea）
 *
 * @example
 * <LessonProgressBar progress={72} />
 * <LessonProgressBar progress={100} showPercent={false} />
 * <LessonProgressBar progress={50} width={350} />
 */
export function LessonProgressBar({
  progress,
  showPercent = true,
  width,
  className,
}: LessonProgressBarProps) {
  // 進捗率を0-100に制限
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn("flex items-center gap-[9px]", className)}
      style={{ width: width || "100%" }}
    >
      {/* バー */}
      <div className="flex-1 h-[7px] bg-[#eaeaea] rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-[40px] transition-all duration-300"
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>

      {/* パーセント表示 */}
      {showPercent && (
        <div className="flex items-end font-bold font-rounded-mplus text-black whitespace-nowrap">
          <span className="text-2xl tracking-[-0.48px] leading-none">
            {Math.round(progress)}
          </span>
          <span className="text-[10px] leading-none">%</span>
        </div>
      )}
    </div>
  );
}

export default LessonProgressBar;
