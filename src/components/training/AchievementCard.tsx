
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import ShareButton from './ShareButton';
import AchievementBadge from './AchievementBadge';

interface AchievementCardProps {
  title: string;
  description?: string;
  shareText?: string;
  className?: string;
  isTraining?: boolean;
  badgeType?: 'beginner' | 'intermediate' | 'advanced' | 'master' | 'expert';
}

/**
 * 達成を表示して共有を促すカードコンポーネント
 * AchievementBadgeを統合し、ゲーミフィケーション要素を強化
 */
const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  shareText = "このトレーニングを完了しました！",
  className,
  isTraining = false,
  badgeType = 'beginner'
}) => {
  const shareTitle = isTraining 
    ? `トレーニング「${title}」を完了しました！`
    : `タスク「${title}」を完了しました！`;
    
  return (
    <Card className={cn("overflow-hidden border-green-200 dark:border-green-800", className)}>
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-1">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              達成！
            </Badge>
          </div>
          <AchievementBadge type={badgeType} animated />
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg mt-2">
          {isTraining ? "トレーニングを完了しました！" : "タスクを完了しました！"}
        </CardTitle>
        <CardDescription>
          {description || `「${title}」の${isTraining ? "すべてのタスク" : "課題"}を達成しました。おめでとうございます！`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <ShareButton 
            title={shareTitle} 
            text={`${shareText} #BONOTraining`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// cn関数をインポート忘れを修正
import { cn } from '@/lib/utils';

export default AchievementCard;
