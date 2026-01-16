import { CategoryTag } from "@/components/ui/CategoryTag";
import { LessonProgressBar } from "@/components/ui/LessonProgressBar";
import { Button } from "@/components/ui/button";

interface LessonTitleAreaProps {
  lesson: {
    title: string;
    category?: string;
    description?: string;
  };
  /** 進捗率 0-100 */
  progress: number;
  /** 「スタートする」クリック時のコールバック */
  onStart?: () => void;
  /** 「概要・目的ですべてみる」クリック時のコールバック（タブ切替） */
  onViewAllDetails?: () => void;
}

/**
 * レッスンタイトルエリア（右側メインコンテンツ）
 *
 * Figma仕様:
 * - カテゴリタグ + タイトル + 進捗バー + 説明 + CTAボタン
 * - 進捗バー幅: 350px
 * - 説明文: 3行clamp、max-height 88px（fit-content）
 *
 * @example
 * <LessonTitleArea
 *   lesson={{ title: "UIデザインサイクル", category: "UIデザイン" }}
 *   progress={72}
 *   onStart={() => navigate('/articles/...')}
 * />
 */
export function LessonTitleArea({
  lesson,
  progress,
  onStart,
  onViewAllDetails,
}: LessonTitleAreaProps) {
  return (
    <div className="flex flex-col gap-[14px] items-start w-full">
      {/* カテゴリタグ */}
      {lesson.category && (
        <div className="flex items-center w-full">
          <CategoryTag category={lesson.category} />
        </div>
      )}

      {/* タイトル */}
      <div className="flex flex-col items-start w-full">
        <h1 className="font-rounded-mplus font-bold text-[32px] text-[#0d221d] leading-[40px] w-full">
          {lesson.title}
        </h1>
      </div>

      {/* 進捗バー（レスポンシブ: 64%幅） */}
      <LessonProgressBar progress={progress} width="64%" />

      {/* 説明文エリア */}
      {lesson.description && (
        <div className="flex flex-col gap-[3px] items-start w-full">
          <div className="w-full h-fit max-h-[88px] overflow-hidden">
            <p className="font-noto-sans-jp text-[16px] text-[#4b5563] leading-[1.6] line-clamp-3">
              {lesson.description}
            </p>
          </div>
          {onViewAllDetails && (
            <button
              className="font-noto-sans-jp font-medium text-[14px] text-[#1e0ff0] leading-[1.6] hover:underline"
              onClick={onViewAllDetails}
            >
              概要・目的ですべてみる
            </button>
          )}
        </div>
      )}

      {/* CTAボタン */}
      <div className="flex items-start w-full">
        <Button
          size="large"
          variant="default"
          onClick={onStart}
          className="bg-black text-white hover:bg-black/90"
        >
          スタートする
        </Button>
      </div>
    </div>
  );
}

export default LessonTitleArea;
