
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Training } from '@/types/training';
import CategoryTag from './CategoryTag';

interface PortfolioTrainingCardProps {
  training: Training;
  className?: string;
}

const PortfolioTrainingCard: React.FC<PortfolioTrainingCardProps> = ({ training, className }) => {
  return (
    <Link 
      to={`/training/${training.slug}`} 
      className={cn("block w-full max-w-[328px] mx-auto", className)}
    >
      {/* Step 1: 外側コンテナ（training_content） */}
      <div className="relative w-[328px] h-[346px] pt-6 flex flex-col justify-end rounded-[32px] overflow-hidden hover:scale-105 transition-transform duration-300">
        
        {/* Step 3: グラデーション背景 */}
        <div 
          className="absolute inset-0 w-[571px] h-[328px]"
          style={{
            background: 'linear-gradient(183deg, #F5F8FD 2.2%, #FAF4F0 49.72%, rgba(222, 228, 242, 0.00) 97.86%)',
            left: '-140px',
            top: '-150px'
          }}
        />

        {/* Step 2: 内部ブロック構造 */}
        <div className="relative z-10 px-[34px] pb-6 flex flex-col items-center gap-3">
          
          {/* Step 2-1: アイコン部分 */}
          <div className="w-[72px] h-[72px] p-[11px] flex justify-center items-center bg-white border-[0.9px] border-black/10 rounded-[100px_100px_12px_12px]">
            <img
              src={training.icon || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7'}
              alt={training.title}
              className="w-[49.5px] h-[49.5px] object-cover rounded-lg"
            />
          </div>

          {/* Step 2-2: コンテンツブロック（260×102px） */}
          <div className="w-[260px] h-[102px] flex flex-col gap-2">
            {/* タイプタグ */}
            <div className="flex justify-start">
              <CategoryTag type={training.type} displayMode="type" />
            </div>
            
            {/* タイトルと説明 */}
            <div className="flex flex-col gap-1 text-left">
              <h3 className="text-[20px] font-bold font-['Rounded_Mplus_1c'] leading-[1.2] text-[#020617]">
                {training.title}
              </h3>
              <p className="text-[14px] font-normal leading-[1.4] text-[#64748B] line-clamp-2">
                {training.description || ''}
              </p>
            </div>
          </div>

          {/* Step 2-3: 区切り線 */}
          <div className="w-full max-w-[260px] h-[1px] bg-[#E2E8F0]" />

          {/* Step 2-4: フッター部分 */}
          <div className="w-full max-w-[260px] h-[28px] flex justify-between items-center gap-5">
            {/* カテゴリタグ */}
            <CategoryTag category={training.category || 'UIビジュアル'} displayMode="category" />

            {/* お題内容をみるボタン（3層構造） */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="rounded-full py-1 px-4 flex items-center gap-2">
                  <span className="text-[#111827] text-sm font-semibold whitespace-nowrap">
                    お題内容をみる
                  </span>
                  <div className="w-5 h-5 bg-[#0d221d] rounded-full flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PortfolioTrainingCard;
