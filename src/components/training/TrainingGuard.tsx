
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import PremiumContentBanner from './PremiumContentBanner';
import { Loader2 } from 'lucide-react';

interface TrainingGuardProps {
  children: ReactNode;
  isPremium?: boolean;
  fallbackComponent?: React.ReactNode;
}

/**
 * トレーニングコンテンツのアクセス制御を行うコンポーネント
 * メンバーシップを持つユーザーのみが有料コンテンツにアクセスできるようにする
 */
const TrainingGuard: React.FC<TrainingGuardProps> = ({
  children,
  isPremium = false,
  fallbackComponent
}) => {
  const { isSubscribed, planMembers, loading } = useSubscriptionContext();
  const navigate = useNavigate();
  
  // 無料コンテンツの場合は常にアクセス可能
  if (!isPremium) {
    return <>{children}</>;
  }
  
  // ローディング中は読み込み表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // メンバーシップを持つユーザーはアクセス可能
  if (isSubscribed && planMembers) {
    return <>{children}</>;
  }
  
  // カスタム表示コンポーネントが指定されている場合はそれを表示
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }
  
  // デフォルトのプレミアムコンテンツバナーを表示
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-medium text-amber-800 mb-2">プレビュー表示</h3>
        <p className="text-amber-700">
          このコンテンツの一部を無料で閲覧しています。
          すべてのコンテンツを閲覧するにはメンバーシップへの登録が必要です。
        </p>
      </div>
      
      <PremiumContentBanner />
    </div>
  );
};

export default TrainingGuard;
