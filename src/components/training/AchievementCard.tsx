
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import ShareButton from './ShareButton';

interface AchievementCardProps {
  title: string;
  description?: string;
  shareText?: string;
  className?: string;
  isTraining?: boolean;
}

/**
 * 達成を表示して共有を促すカードコンポーネント
 */
const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  shareText = "このトレーニングを完了しました！",
  className,
  isTraining = false
}) => {
  const shareTitle = isTraining 
    ? `トレーニング「${title}」を完了しました！`
    : `タスク「${title}」を完了しました！`;
    
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              達成！
            </Badge>
          </div>
        </div>
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

export default AchievementCard;
