
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
        <div className="relative h-[500px] flex flex-col justify-center items-center rounded-[320px_320px_32px_32px] border-2 border-[#374151] bg-[#FAFBF8] overflow-hidden">
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
                {training.description || ''}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="px-1 py-0.5 bg-[#F1F5F9] rounded-md">
                  <span className="text-[10px] font-medium font-['Rounded_Mplus_1c'] text-[#1D283D]">
                    難易度
                  </span>
                </div>
                <span className="text-[14px] font-semibold text-[#1D283D]">
                  {training.difficulty || '未設定'}
                </span>
              </div>
              {training.tags && training.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="px-1 py-0.5 bg-[#F1F5F9] rounded-md">
                    <span className="text-[10px] font-medium font-['Rounded_Mplus_1c'] text-[#1D283D]">
                      タグ
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#1D283D]">
                    {training.tags[0]}
                  </span>
                </div>
              )}
            </div>

            <button className="w-full mt-2 py-2.5 px-4 rounded-full border-2 border-[#020617] hover:bg-gray-50 transition-colors">
              <span className="text-[14px] font-bold font-['Rounded_Mplus_1c'] tracking-[0.75px] text-[#020617]">
                トレーニングを見る
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrainingCard;
