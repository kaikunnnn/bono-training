
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
      className={cn("block w-full min-w-[280px] max-w-[400px]", className)}
    >
      {/* Step 1: 外側コンテナ（training_content） */}
      <div className="relative w-full flex flex-col justify-end rounded-[32px] overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-100">
        
        {/* Step 3: グラデーション背景 */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/assets/backgrounds/gradation/bg-gradation/bg-gradation-training-list.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'center'
          }}
        />

        {/* Step 2: hoverブロック構造 */}
        <div className="relative z-10 flex flex-col items-center -mt-5">
          
          {/* アイコンと楕円の統合ブロック */}
          <div className="flex flex-col items-start w-full">
            {/* Step 2-1: アイコン部分 */}
            <div className="relative z-30 w-[72px] h-[72px] p-[11px] pt-4 flex justify-center items-center bg-white border-[0.9px] border-black/10 rounded-[100px_100px_32px_32px] top-[56px] ml-[10.4%]">
              <img
                src={training.icon || '/assets/emoji/book.svg'}
                alt={training.title}
                className="w-[49.5px] h-[49.5px] object-cover rounded-lg"
              />
            </div>
            
            {/* 上が円のブロック（SVG） */}
            <svg 
              className="relative z-15 w-full h-[50px]" 
              viewBox="0 0 328 70" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path d="M0 69.2753C0 69.2753 67.866 0 165.787 0C263.709 0 328 69.2753 328 69.2753V70H0V69.2753Z" fill="white"/>
            </svg>
          </div>
          
          {/* コンテンツブロック */}
          <div className="bg-white px-[10.4%] pt-6 pb-6 flex flex-col items-start gap-3">

            {/* Step 2-2: コンテンツブロック（260×102px） */}
            <div className="w-full flex flex-col gap-3">
              {/* タイプタグ */}
              <div className="flex justify-start">
                <CategoryTag type={training.type} displayMode="type" />
              </div>
              
              {/* タイトルと説明 */}
              <div className="flex flex-col gap-2 text-left">
                <h3 className="text-[20px] md:text-lg lg:text-[20px] font-rounded-mplus-bold leading-[1.2] text-[#020617]">
                  {training.title}
                </h3>
                <p className="text-[14px] font-normal leading-[1.4] text-[#64748B] line-clamp-2">
                  {training.description || ''}
                </p>
              </div>
            </div>

            {/* Step 2-3: 区切り線 */}
            <div className="w-full h-[1px] bg-[#E2E8F0]" />

            {/* Step 2-4: フッター部分 */}
            <div className="w-full flex justify-between items-center gap-5">
              {/* カテゴリタグ */}
              <CategoryTag category={training.category || 'UIビジュアル'} displayMode="category" />

              {/* お題内容をみるボタン（3層構造） */}
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="rounded-full py-1 flex items-center gap-2">
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
      </div>
    </Link>
  );
};

export default React.memo(PortfolioTrainingCard);
