
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Training } from '@/types/training';

interface TrainingCardProps {
  training: Training;
  className?: string;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training, className }) => {
  return (
    <Link 
      to={`/training/${training.slug}`} 
      className={cn("max-w-[453px] w-full mx-auto flex flex-col gap-6", className)}
    >
      <div className="w-full flex flex-col">
        {/* カードの上部 */}
        <div className="relative h-[499.554px] flex flex-col justify-center items-center px-0 pt-16 pb-8 rounded-[320px_320px_32px_32px] border-2 border-[#374151] bg-[#FAFBF8] overflow-hidden">
          {/* 背景画像（ブラー効果付き） */}
          {training.thumbnailImage && (
            <div className="absolute inset-0 w-[957px] h-[638px] flex justify-center items-center">
              <img
                src={training.thumbnailImage}
                alt=""
                className="w-full h-full object-cover filter blur-[8.89px]"
                style={{
                  position: 'absolute',
                  right: '-252.199px',
                  bottom: '-73.446px'
                }}
              />
            </div>
          )}

          {/* メインのサムネイル画像 */}
          <div className="relative w-[342.161px] h-[293.827px] flex justify-center items-center">
            {training.thumbnailImage && (
              <img
                src={training.thumbnailImage}
                alt={training.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* カードの下部コンテンツ */}
        <div className="mt-6 flex flex-col gap-4">
          {/* タイトルセクション */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-bold font-['Rounded_Mplus_1c'] tracking-[0.75px] text-[#1D283D]">
              {training.type === 'challenge' ? 'チャレンジ' : 'スキル'}
            </span>
            <h3 className="text-[28px] font-bold font-['Rounded_Mplus_1c'] leading-[149%] tracking-[0.75px] text-[#020617]">
              {training.title}
            </h3>
            <p className="text-[12px] font-normal font-['Rounded_Mplus_1c'] leading-[160%] tracking-[1px] text-[#1D283D]">
              {training.description || ''}
            </p>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-col gap-1">
            {/* 筋トレ部位 */}
            <div className="flex items-center gap-1">
              <div className="w-[60px] px-1 py-0.5 flex justify-center items-center bg-[#F1F5F9] rounded-md">
                <span className="text-[10px] font-medium font-['Rounded_Mplus_1c'] text-[#1D283D]">
                  筋トレ部位
                </span>
              </div>
              <span className="text-[14px] font-semibold font-['Inter'] text-[#1D283D]">
                UIビジュアル
              </span>
            </div>

            {/* 難易度 */}
            <div className="flex items-center gap-1">
              <div className="w-[60px] px-1 py-0.5 flex justify-center items-center bg-[#F1F5F9] rounded-md">
                <span className="text-[10px] font-medium font-['Rounded_Mplus_1c'] text-[#1D283D]">
                  難易度
                </span>
              </div>
              <span className="text-[14px] font-semibold font-['Inter'] text-[#1D283D]">
                {training.difficulty || '未設定'}
              </span>
            </div>
          </div>

          {/* CTAボタン */}
          <button className="w-full mt-2 py-2.5 px-4 flex justify-center items-center rounded-full border border-[#020617]">
            <span className="text-[14px] font-extrabold font-['Rounded_Mplus_1c'] tracking-[0.75px] text-[#020617]">
              トレーニングを見る
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TrainingCard;
