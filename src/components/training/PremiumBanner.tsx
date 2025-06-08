
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBannerProps {
  className?: string;
}

/**
 * プレミアムコンテンツの制限を示すバナー
 */
const PremiumBanner: React.FC<PremiumBannerProps> = ({ className }) => {
  return (
    <div className={cn(
      'my-8 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 text-center shadow-md',
      className
    )}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-amber-100 text-amber-600">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">メンバー限定コンテンツ</h3>
        <div className="p-2 rounded-full bg-amber-100 text-amber-600">
          <Star className="w-5 h-5" />
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">
        ここから先は <strong>メンバー限定</strong> コンテンツです。<br />
        より詳しい解説や実践的な内容をご覧いただけます。
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link 
          to="/pricing"
          className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          プランを見る
        </Link>
        <span className="text-sm text-gray-500">
          月額1,480円〜で全コンテンツ見放題
        </span>
      </div>
    </div>
  );
};

export default PremiumBanner;
