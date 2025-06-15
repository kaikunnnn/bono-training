
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumContentBannerProps {
  className?: string;
  onSubscribe?: () => void;
}

const PremiumContentBanner: React.FC<PremiumContentBannerProps> = ({ 
  className,
  onSubscribe 
}) => {
  return (
    <Card className={cn("border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50", className)}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          プレミアムコンテンツ
        </h3>
        
        <p className="text-gray-600 mb-4">
          このコンテンツはメンバー限定です。<br />
          メンバーシップに登録して、すべてのトレーニングにアクセスしましょう。
        </p>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center justify-center">
            <Star className="w-4 h-4 text-orange-500 mr-2" />
            <span>実践的なデザインプロジェクト</span>
          </div>
          <div className="flex items-center justify-center">
            <Star className="w-4 h-4 text-orange-500 mr-2" />
            <span>プレミアム学習教材</span>
          </div>
          <div className="flex items-center justify-center">
            <Star className="w-4 h-4 text-orange-500 mr-2" />
            <span>コミュニティ参加権限</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {onSubscribe ? (
            <Button 
              onClick={onSubscribe}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              メンバーシップに登録する（¥1,480/月）
            </Button>
          ) : (
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
              <Link to="/training/plan">
                メンバーシップに登録する（¥1,480/月）
              </Link>
            </Button>
          )}
          
          <p className="text-xs text-gray-500">
            いつでも解約可能・初回課金後即座にアクセス可能
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumContentBanner;
