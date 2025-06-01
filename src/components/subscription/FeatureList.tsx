import React from 'react';
import { Star } from 'lucide-react';
import { ContentAccessType } from '@/utils/subscriptionPlans';

// コンテンツタイプに応じた機能リストを返す
function getFeaturesByContentType(contentType: ContentAccessType): string[] {
  switch (contentType) {
    case 'learning':
      return [
        '全ての学習コンテンツへのアクセス',
        '追加コンテンツの利用',
        'プレミアムサポート'
      ];
    case 'member':
      return [
        '全てのメンバー限定コンテンツへのアクセス',
        '全てのトレーニングプログラムへのアクセス',
        '実践的なスキル習得カリキュラム',
        'ハンズオンでの技術習得',
        'プロジェクト例と解説',
        'コミュニティへの参加'
      ];
    default:
      return [
        'プレミアムコンテンツへのアクセス',
        '追加機能の利用',
        'プレミアムサポート'
      ];
  }
}

interface FeatureListProps {
  contentType: ContentAccessType;
}

const FeatureList: React.FC<FeatureListProps> = ({ contentType }) => {
  const features = getFeaturesByContentType(contentType);
  
  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center">
          <Star className="h-5 w-5 text-amber-500 mr-2" />
          {feature}
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
