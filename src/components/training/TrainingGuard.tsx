
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import PremiumContentBanner from './PremiumContentBanner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
  const { isSubscribed, hasMemberAccess, loading, error } = useSubscriptionContext();
  const navigate = useNavigate();
  
  // 無料コンテンツの場合は常にアクセス可能
  if (!isPremium) {
    return <>{children}</>;
  }
  
  // ローディング中は読み込み表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner size="lg" text="アクセス権限を確認中..." />
      </div>
    );
  }
  
  // エラーが発生した場合
  if (error) {
    console.error('TrainingGuard - アクセス権限確認エラー:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">アクセス権限の確認に失敗しました</h3>
        <p className="text-red-700 mb-4">
          一時的なエラーが発生しました。ページを再読み込みするか、しばらく時間をおいてからお試しください。
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          ページを再読み込み
        </button>
      </div>
    );
  }
  
  // デバッグ情報（開発環境でのみ表示）
  if (process.env.NODE_ENV === 'development') {
    console.log('TrainingGuard - アクセス制御状態:', {
      isPremium,
      isSubscribed,
      hasMemberAccess,
      hasAccess: isSubscribed && hasMemberAccess,
      loading,
      error
    });
  }
  
  // メンバーシップを持つユーザーはアクセス可能
  if (isSubscribed && hasMemberAccess) {
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
        {!isSubscribed && (
          <p className="text-amber-600 text-sm mt-2">
            💡 メンバーシップに登録すると、全ての学習コンテンツにアクセスできます。
          </p>
        )}
      </div>
      
      <PremiumContentBanner />
    </div>
  );
};

export default TrainingGuard;
