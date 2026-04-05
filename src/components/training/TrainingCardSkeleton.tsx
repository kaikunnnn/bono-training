import React from 'react';
import { cn } from '@/lib/utils';

interface TrainingCardSkeletonProps {
  className?: string;
}

/**
 * TrainingCard のスケルトン表示
 * ローディング中にカードの形状を維持してちらつきを防ぐ
 */
const TrainingCardSkeleton: React.FC<TrainingCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("w-full max-w-[400px] flex flex-col gap-6 animate-pulse", className)}>
      <div className="w-full flex flex-col">
        {/* カードの上部 - 画像エリア */}
        <div className="relative h-[499.554px] flex flex-col justify-center items-center px-0 pt-16 pb-8 rounded-[320px_320px_32px_32px] border-2 border-gray-200 bg-gray-100 overflow-hidden">
          {/* メインのサムネイル画像プレースホルダー */}
          <div className="relative w-[342.161px] h-[293.827px] bg-gray-200 rounded-lg" />
        </div>

        {/* カードの下部コンテンツ */}
        <div className="mt-6 flex flex-col gap-4">
          {/* タイトルセクション */}
          <div className="flex flex-col gap-2">
            {/* タイプラベル */}
            <div className="h-4 w-20 bg-gray-200 rounded" />
            {/* タイトル */}
            <div className="h-8 w-full bg-gray-200 rounded" />
            {/* 説明文 */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="w-[60px] h-5 bg-gray-200 rounded-md" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-[60px] h-5 bg-gray-200 rounded-md" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          </div>

          {/* CTAボタン */}
          <div className="w-full mt-2 py-2.5 px-4 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(TrainingCardSkeleton);
