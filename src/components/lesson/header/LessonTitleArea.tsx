import { Map } from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { LessonProgressBar } from "@/components/ui/LessonProgressBar";
import { Button } from "@/components/ui/button";

interface LinkedRoadmap {
  slug: string;
  title: string;
  shortTitle?: string;
}

interface LessonTitleAreaProps {
  lesson: {
    title: string;
    category?: string;
    description?: string;
    linkedRoadmaps?: LinkedRoadmap[];
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
      <div className="flex flex-col gap-1.5 items-start w-full">
        <h1 className="font-rounded-mplus font-bold text-[32px] text-[#0d221d] leading-[40px] w-full">
          {lesson.title}
        </h1>
        {/* ロードマップ紐づき表示 */}
        {lesson.linkedRoadmaps && lesson.linkedRoadmaps.length > 0 && (
          <div className="flex items-center gap-1 text-[rgba(13,34,29,0.48)]">
            <Map className="w-3.5 h-3.5 flex-shrink-0" />
            <div className="font-noto-sans-jp text-[13px] font-medium flex items-center flex-wrap gap-x-1">
              {lesson.linkedRoadmaps.map((roadmap, index) => (
                <span key={roadmap.slug} className="flex items-center gap-1">
                  <Link
                    to={`/roadmaps/${roadmap.slug}`}
                    className="underline hover:text-[rgba(13,34,29,0.7)] transition-colors"
                  >
                    {roadmap.shortTitle || roadmap.title}
                  </Link>
                  {index < lesson.linkedRoadmaps!.length - 1 && <span>,</span>}
                </span>
              ))}
            </div>
          </div>
        )}
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
