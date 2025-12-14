import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import InfoBlock from "./InfoBlock";
import PrimaryButton from "../common/PrimaryButton";

interface LessonHeroProps {
  title: string;
  description?: string;
  iconImage?: any;
  iconImageUrl?: string;
  category?: string;
  isPremium?: boolean;
  onStartClick?: () => void;
  canStart?: boolean;
}

export default function LessonHero({
  title,
  description,
  iconImage,
  iconImageUrl,
  category,
  isPremium,
  onStartClick,
  canStart = true,
}: LessonHeroProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/lessons");
  };

  // アイコン画像のURLを取得（URL優先、なければSanity画像オブジェクト）
  const getIconImageUrl = () => {
    if (iconImageUrl) {
      return iconImageUrl;
    }
    if (iconImage?.asset?._ref) {
      return urlFor(iconImage).width(123).height(184).url();
    }
    return null;
  };

  const iconUrl = getIconImageUrl();

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
              レッスン一覧
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
          {iconUrl && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{
                top: "-120px",
                zIndex: 3,
              }}
            >
              <div className="rounded-r-lg shadow-[1px_1px_12px_0_rgba(0,0,0,0.24)]">
                <img
                  src={iconUrl}
                  alt={title}
                  className="h-32 w-auto object-cover"
                />
              </div>
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
