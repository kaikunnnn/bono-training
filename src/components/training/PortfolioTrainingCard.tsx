
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
      {/* training_content: 外側コンテナ (328×346px, cornerRadius:32, paddingTop:24) */}
      <div className="relative w-[328px] h-[346px] pt-6 rounded-[32px] overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[1px_1px_12px_rgba(0,0,0,0.06)]">
        
        {/* background-image-gradation: グラデーション背景 (328×94px) */}
        <div className="absolute top-0 left-0 w-[328px] h-[94px]">
          {/* 表紙: グラデーション要素 (571×328px) */}
          <div 
            className="absolute w-[571px] h-[328px]"
            style={{
              background: 'linear-gradient(183deg, #F5F8FD 2.2%, #FAF4F0 49.72%, rgba(222, 228, 242, 0.00) 97.86%)',
              left: '-140px',
              top: '-150px'
            }}
          />
        </div>

        {/* wrap: メインコンテンツラッパー (328×322px) */}
        <div className="relative flex flex-col w-[328px] h-[322px]">
          
          {/* Rectangle 7: 白い楕円背景 (328×50px) */}
          <div className="w-[328px] h-[50px] bg-white" />

          {/* hover: メインコンテンツブロック (328×272px, itemSpacing:-18px) */}
          <div className="w-[328px] h-[272px] flex flex-col px-8 pr-9 pb-5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] -mt-[18px]">
            
            {/* icon: アイコンブロック (72×72px) */}
            <div className="w-[72px] h-[72px] p-[11px] flex justify-center items-center bg-white border-[0.9px] border-black/10 rounded-[100px_100px_12px_12px]">
              <img
                src={training.icon || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7'}
                alt={training.title}
                className="w-[49.5px] h-[49.5px] object-cover rounded-lg"
              />
            </div>

            {/* Frame 3467245: コンテンツエリア (260×198px, paddingTop:36px) */}
            <div className="w-[260px] h-[198px] flex flex-col pt-9 gap-4">
              
              {/* Image: タイプタグ+タイトル+説明 (260×102px) */}
              <div className="w-[260px] h-[102px] flex flex-col gap-2">
                {/* Component 5: タイプタグ */}
                <div className="flex justify-start">
                  <CategoryTag type={training.type} displayMode="type" />
                </div>
                
                {/* Heading: タイトルと説明 */}
                <div className="flex flex-col gap-1 text-left">
                  <h3 className="text-[20px] font-bold font-['Rounded_Mplus_1c'] leading-[1.2] text-[#020617]">
                    {training.title}
                  </h3>
                  <p className="text-[14px] font-normal leading-[1.4] text-[#64748B] line-clamp-2">
                    {training.description || ''}
                  </p>
                </div>
              </div>

              {/* Line 14: 区切り線 (260×0px) */}
              <div className="w-[260px] h-[1px] bg-[#E2E8F0]" />

              {/* footerarea: フッターエリア (260×28px) */}
              <div className="w-[260px] h-[28px] flex justify-between items-center gap-5">
                {/* category-tag: カテゴリタグ */}
                <CategoryTag category={training.category || 'UIビジュアル'} displayMode="category" />

                {/* button お題を見る: ボタンエリア (126×28px) */}
                <div className="w-[126px] h-[28px] flex items-center">
                  <div className="flex items-center gap-2">
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

export default PortfolioTrainingCard;
