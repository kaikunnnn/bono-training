
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
    <Link to={`/training/${training.slug}`} className={cn("block w-full", className)}>
      <div className="w-full flex flex-col">
        {/* メインビジュアル */}
        <div className="relative h-[500px] flex flex-col justify-center items-center rounded-[320px_320px_32px_32px] border-2 border-[#374151] bg-[#FAFBF8] overflow-hidden">
          {/* 背景画像 */}
          {training.backgroundImage && (
            <div className="absolute inset-0 w-full h-full">
              <img
                src={training.backgroundImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* サムネイル画像 */}
          {training.thumbnailImage && (
            <div className="relative w-[342px] h-[294px]">
              <img
                src={training.thumbnailImage}
                alt={training.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* 無料バッジ */}
          {training.isFree && (
            <div className="absolute top-4 right-4">
              <svg width="57" height="56" viewBox="0 0 57 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26.3618 1.42357C27.4434 0.585567 28.955 0.585567 30.0366 1.42357L34.615 4.97082C35.166 5.39768 35.8483 5.61939 36.5449 5.59789L42.334 5.41923C43.7016 5.37702 44.9245 6.2655 45.3069 7.5792L46.9259 13.1401C47.1207 13.8093 47.5425 14.3897 48.1187 14.7818L52.9071 18.04C54.0383 18.8097 54.5054 20.2473 54.0427 21.5349L52.0839 26.9854C51.8481 27.6413 51.8481 28.3587 52.0839 29.0146L54.0427 34.4651C54.5054 35.7527 54.0383 37.1903 52.9071 37.96L48.1187 41.2182C47.5425 41.6103 47.1207 42.1907 46.9259 42.8599L45.3069 48.4208C44.9245 49.7345 43.7016 50.623 42.334 50.5808L36.5449 50.4021C35.8483 50.3806 35.166 50.6023 34.615 51.0292L30.0366 54.5764C28.955 55.4144 27.4434 55.4144 26.3618 54.5764L21.7834 51.0292C21.2325 50.6023 20.5501 50.3806 19.8535 50.4021L14.0645 50.5808C12.6969 50.623 11.474 49.7345 11.0915 48.4208L9.47252 42.8599C9.2777 42.1907 8.85597 41.6103 8.27975 41.2182L3.49131 37.96C2.3601 37.1903 1.89299 35.7527 2.35575 34.4651L4.31458 29.0146C4.55029 28.3587 4.55029 27.6413 4.31458 26.9854L2.35575 21.5349C1.89299 20.2473 2.36009 18.8097 3.49131 18.04L8.27975 14.7818C8.85597 14.3897 9.2777 13.8093 9.47252 13.1401L11.0915 7.5792C11.474 6.2655 12.6969 5.37702 14.0645 5.41923L19.8535 5.59789C20.5501 5.61939 21.2325 5.39768 21.7834 4.97082L26.3618 1.42357Z" fill="#E5E5E5"/>
                <text transform="translate(15.2891 15) rotate(6)" fill="#020617" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                  <tspan x="0" y="15.0909">無料</tspan>
                </text>
                <text transform="translate(16.0039 34.4087) rotate(6)" fill="#020617" style={{ fontFamily: 'Inter', fontSize: '3px' }}>
                  <tspan x="0" y="3.09091">むりょうくうしょ</tspan>
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* コンテンツ情報 */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-bold font-['Rounded_Mplus_1c'] tracking-[0.75px] text-[#1D283D]">
              {training.type === 'challenge' ? 'チャレンジ' : 'スキル'}
            </span>
            <h3 className="text-[28px] font-bold font-['Rounded_Mplus_1c'] leading-[149%] tracking-[0.75px] text-[#020617]">
              {training.title}
            </h3>
            <p className="text-[12px] font-normal font-['Rounded_Mplus_1c'] leading-[160%] tracking-[1px] text-[#1D283D]">
              {training.description}
            </p>
          </div>

          {/* タグ */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="px-1 py-0.5 bg-[#F1F5F9] rounded-md">
                <span className="text-[10px] font-medium font-['Rounded_Mplus_1c'] text-[#1D283D]">
                  筋トレ部位
                </span>
              </div>
              <span className="text-[14px] font-semibold text-[#1D283D]">
                {training.tags[0]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-1 py-0.5 bg-[#F1F5F9] rounded-md">
                <span className="text-[10px] font-medium font-['Rounded_Mplus_1c'] text-[#1D283D]">
                  難易度
                </span>
              </div>
              <span className="text-[14px] font-semibold text-[#1D283D]">
                {training.difficulty}
              </span>
            </div>
          </div>

          {/* CTA ボタン */}
          <button className="w-full mt-2 py-2.5 px-4 rounded-full border-2 border-[#020617] hover:bg-gray-50 transition-colors">
            <span className="text-[14px] font-bold font-['Rounded_Mplus_1c'] tracking-[0.75px] text-[#020617]">
              トレーニングを見る
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TrainingCard;
