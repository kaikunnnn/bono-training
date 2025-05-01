
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PremiumContentBannerProps {
  className?: string;
  onSubscribe?: () => void;
  returnUrl?: string;
}

/**
 * プレミアムコンテンツのプレビュー制限バナー
 */
const PremiumContentBanner: React.FC<PremiumContentBannerProps> = ({
  className,
  onSubscribe,
  returnUrl = window.location.pathname
}) => {
  const handleClick = () => {
    if (onSubscribe) {
      onSubscribe();
    }
  };

  return (
    <div className={cn(
      'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6 shadow-sm',
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-amber-100 text-amber-600">
          <Star className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">プレミアムコンテンツ</h3>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
              <Lock className="w-3 h-3 mr-1" />
              プレミアム限定
            </Badge>
          </div>
          
          <p className="mt-2 text-gray-700">
            このコンテンツの続きを閲覧するには、プレミアムプランへのアップグレードが必要です。
            プレミアムプランでは、すべてのトレーニングコンテンツに無制限でアクセスできます。
          </p>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleClick}
            >
              プレミアムに登録する
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/pricing">料金プランを見る</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumContentBanner;
