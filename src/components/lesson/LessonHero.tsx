import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import InfoBlock from "./InfoBlock";
import PrimaryButton from "../common/PrimaryButton";

interface LessonHeroProps {
  title: string;
  description?: string;
  iconImage?: any;
  category?: string;
  isPremium?: boolean;
  onStartClick?: () => void;
  canStart?: boolean;
}

export default function LessonHero({
  title,
  description,
  iconImage,
  category,
  isPremium,
  onStartClick,
  canStart = true,
}: LessonHeroProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/lessons");
  };

  return (
    <div className="w-full">
      {/* グラデーション領域 */}
      <div className="h-[216px] bg-hero-gradient relative">
        {/* バックナビゲーション */}
        <div className="container mx-auto pt-6">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-lesson-hero-nav-text hover:text-lesson-hero-text transition"
          >
            <ArrowLeft size={20} />
            <span className="font-rounded-mplus text-sm">
              トレーニング一覧
            </span>
          </button>
        </div>
      </div>

      {/* 楕円弧要素 */}
      <div className="arc-wrapper">
        <div className="ellipse"></div>
      </div>

      {/* 詳細情報領域 */}
      <div className="bg-white">
        <div className="container mx-auto relative">
          {/* アイコン（絶対配置で上にはみ出させる） */}
          {iconImage?.asset?._ref && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 bg-white overflow-hidden"
              style={{
                top: "-120px",
                width: "123px",
                height: "184px",
                borderRadius: "0px 4px 4px 0px",
                boxShadow: "1px 1px 13.56px 0px rgba(0, 0, 0, 0.33)",
                zIndex: 3,
              }}
            >
              <img
                src={urlFor(iconImage).width(123).height(184).url()}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* コンテンツ */}
          <div className="pt-20 pb-12 max-w-3xl mx-auto text-center">
            {/* タイトル */}
            <h1 className="font-rounded-mplus font-bold text-4xl text-lesson-hero-text mb-4">
              {title}
            </h1>

            {/* 説明 */}
            {description && (
              <p className="font-noto-sans-jp text-base text-gray-600 mb-6">
                {description}
              </p>
            )}

            {/* インフォブロック */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {category && <InfoBlock label="カテゴリ" values={[category]} />}
              {isPremium && <InfoBlock label="プラン" values={["プレミアム"]} />}
            </div>

            {/* スタートボタン */}
            <div className="flex justify-center">
              <PrimaryButton onClick={onStartClick} disabled={!canStart}>
                スタートする
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
