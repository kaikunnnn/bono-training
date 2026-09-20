import React from "react";
import Image from "next/image";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { getOptimizedTrainingImage } from "@/lib/training-images";
import { cn } from "@/lib/utils";
import type { Training } from "@/types/training";

interface TrainingCardProps {
  training: Training;
  className?: string;
  imageLoading?: "eager" | "lazy";
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  training,
  className,
  imageLoading = "lazy",
}) => {
  const thumbnailImage = getOptimizedTrainingImage(training.thumbnailImage);

  return (
    <IntentPrefetchLink
      href={`/training/${training.slug}`}
      className={cn("w-full max-w-[400px] flex flex-col gap-6", className)}
    >
      <div className="w-full flex flex-col">
        {/* カードの上部 */}
        <div className="relative h-[499.554px] flex flex-col justify-center items-center px-0 pt-16 pb-8 rounded-[320px_320px_32px_32px] border-2 border-[#374151] bg-[#FAFBF8] overflow-hidden">
          {/* 背景画像（ブラー効果付き） */}
          <div className="absolute inset-0 scale-110">
            <Image
              src={thumbnailImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 768px) 46vw, calc(100vw - 32px)"
              loading="lazy"
              className="object-cover filter blur-[8.89px]"
            />
          </div>

          {/* メインのサムネイル画像 */}
          <div className="relative w-[342.161px] h-[293.827px] flex justify-center items-center">
            <Image
              src={thumbnailImage}
              alt={training.title}
              fill
              sizes="(min-width: 1024px) 342px, (min-width: 768px) 40vw, calc(100vw - 64px)"
              loading={imageLoading}
              className="object-cover"
            />
          </div>
        </div>

        {/* カードの下部コンテンツ */}
        <div className="mt-6 flex flex-col gap-4">
          {/* タイトルセクション */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-bold font-rounded-mplus tracking-[0.75px] text-text-primary">
              {training.type === "challenge" ? "チャレンジ" : "スキル"}
            </span>
            <h3 className="text-[22px] md:text-2xl lg:text-[28px] font-bold font-rounded-mplus leading-[149%] tracking-[0.75px] text-text-primary">
              {training.title}
            </h3>
            <p className="text-[12px] font-normal font-rounded-mplus leading-[160%] tracking-[1px] text-text-primary">
              {training.description || ""}
            </p>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-col gap-1">
            {/* 筋トレ部位 */}
            <div className="flex items-center gap-1">
              <div className="w-[60px] px-1 py-0.5 flex justify-center items-center bg-muted-custom rounded-md">
                <span className="text-[10px] font-medium font-rounded-mplus text-text-primary">
                  筋トレ部位
                </span>
              </div>
              <span className="text-[14px] font-semibold font-['Inter'] text-text-primary">
                UIビジュアル
              </span>
            </div>

            {/* 難易度 */}
            <div className="flex items-center gap-1">
              <div className="w-[60px] px-1 py-0.5 flex justify-center items-center bg-muted-custom rounded-md">
                <span className="text-[10px] font-medium font-rounded-mplus text-text-primary">
                  難易度
                </span>
              </div>
              <span className="text-[14px] font-semibold font-['Inter'] text-text-primary">
                {training.difficulty || "未設定"}
              </span>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="w-full mt-2 py-2.5 px-4 flex justify-center items-center rounded-full border border-[#020617] hover:bg-gray-50 transition-colors">
            <span className="text-[14px] font-extrabold font-rounded-mplus tracking-[0.75px] text-text-primary">
              トレーニングを見る
            </span>
          </div>
        </div>
      </div>
    </IntentPrefetchLink>
  );
};

export default React.memo(TrainingCard);
