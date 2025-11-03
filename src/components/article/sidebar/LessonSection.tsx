import { Link } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/types/sanity";

interface LessonSectionProps {
  title: string;
  thumbnail?: SanityImage;
  progressPercent: number;
  lessonSlug: string;
}

/**
 * LessonSection コンポーネント
 * サイドナビゲーションのレッスン詳細カード
 *
 * 仕様（re_side_lesson_back_navi.md準拠）:
 * - 縦配置（flex column、align-items: center）
 * - サムネイル: 53.33 x 80px、右側のみボーダーラディウス 5.33px、シャドウあり
 * - タイトル: 13px Inter 500、色 #101828、左寄せ
 * - プログレスバー: 160 x 2px、背景 #E5E7EB、フィル #155DFC（高さ4px）
 * - パーセンテージ: 数値 12px + 単位 10px、色 #6A7282、ギャップ 2px
 * - ギャップ: wrap 6px、progress 5px
 */
const LessonSection = ({
  title,
  thumbnail,
  progressPercent,
  lessonSlug,
}: LessonSectionProps) => {
  return (
    <div className="flex flex-col w-full gap-1 bg-transparent">
      {/* ラップコンテナ */}
      <Link
        to={`/lessons/${lessonSlug}`}
        className="flex flex-col items-center w-full gap-1.5 no-underline hover:opacity-80 transition-opacity cursor-pointer"
      >
        {/* レッスンアイコン 53.33 x 80px */}
        <div
          className="w-[53.33px] h-20 overflow-hidden transition-shadow duration-150"
          style={{
            borderRadius: "0 5.33px 5.33px 0",
            boxShadow: "1.33px 1.33px 18.08px rgba(0, 0, 0, 0.33)",
          }}
        >
          {thumbnail ? (
            <img
              src={urlFor(thumbnail).width(80).height(120).url()}
              alt={title}
              className="w-full h-full object-cover block"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 詳細情報コンテナ */}
        <div className="flex flex-col items-center w-full gap-0">
          {/* レッスンタイトル */}
          <h2
            className="text-[13px] font-medium leading-[1.846em] text-center w-full m-0 p-0"
            style={{
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-2.4%",
              color: "#101828",
            }}
          >
            {title}
          </h2>

          {/* プログレスボックス */}
          <div className="flex items-center justify-center w-full gap-[5px]">
            {/* プログレスバー 160 x 2px */}
            <div
              className="h-[2px] overflow-hidden"
              style={{
                width: "160px",
                borderRadius: "999px",
                backgroundColor: "#E5E7EB",
              }}
            >
              <div
                className="h-1 transition-all"
                style={{
                  width: `${Math.min(100, progressPercent)}%`,
                  backgroundColor: "#155DFC",
                  transitionDuration: "400ms",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>

            {/* パーセンテージ表示 */}
            <div className="flex items-center gap-[2px] whitespace-nowrap">
              <span
                className="text-xs font-normal leading-[1.333em]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "#6A7282",
                }}
              >
                {progressPercent}
              </span>
              <span
                className="text-[10px] font-normal leading-[1.6em]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "#6A7282",
                }}
              >
                %
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LessonSection;
