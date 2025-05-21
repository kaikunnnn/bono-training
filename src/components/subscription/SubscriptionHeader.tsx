
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionHeaderProps {
  isSubscribed: boolean;
  currentPlanName: string;
}

const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  isSubscribed,
  currentPlanName
}) => {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold mb-2">サブスクリプションプラン</h1>
      <p className="text-muted-foreground">
        あなたに合ったプランを選んで、コンテンツやサービスをフル活用しましょう
      </p>
      {isSubscribed && (
        <div className="mt-4">
          <Badge variant="outline" className="text-md py-1 px-3 bg-green-50 text-green-700 border-green-300">
            現在のプラン: {currentPlanName}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SubscriptionHeader;
