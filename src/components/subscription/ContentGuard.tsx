
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentAccessType, hasAccessToContent, UserPlanInfo } from '@/utils/subscriptionPlans';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import FallbackContent from './FallbackContent';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ContentGuardProps {
  children: React.ReactNode;
  /**
   * コンテンツタイプ（'learning', 'member', 'training'）
   */
  contentType: ContentAccessType;
  /**
   * アクセス拒否時のリダイレクト先
   * 指定がない場合はその場でサブスクリプション登録画面を表示
   */
  redirectTo?: string;
  /**
   * カスタムの非サブスクライバー表示コンポーネント
   */
  fallbackComponent?: React.ReactNode;
  /**
   * リダイレクト前の確認メッセージ
   * 指定がない場合は直接リダイレクト
   */
  confirmMessage?: string;
  /**
   * コンテンツ説明（プレミアムバナーに表示）
   */
  contentDescription?: string;
}

/**
 * プランに応じてコンテンツを表示するガードコンポーネント
 */
const ContentGuard: React.FC<ContentGuardProps> = ({
  children,
  contentType,
  redirectTo,
  fallbackComponent,
  confirmMessage,
  contentDescription
}) => {
  const navigate = useNavigate();
  const { isSubscribed, planType } = useSubscriptionContext();
  
  // サブスクリプション情報からユーザープラン情報を作成
  const userPlan: UserPlanInfo = {
    planType,
    isActive: isSubscribed,
  };
  
  // コンテンツへのアクセス権があるかチェック
  const hasAccess = hasAccessToContent(userPlan, contentType);
  
  // リダイレクト処理
  useEffect(() => {
    if (!hasAccess && redirectTo && !confirmMessage) {
      navigate(redirectTo);
    }
  }, [hasAccess, redirectTo, confirmMessage, navigate]);
  
  // アクセス権があれば子コンポーネントを表示
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (redirectTo) {
    const handleRedirect = () => {
      if (confirmMessage) {
        const confirmed = window.confirm(confirmMessage);
        if (confirmed) {
          navigate(redirectTo);
        }
      } else {
        navigate(redirectTo);
      }
    };
    
    // 確認メッセージがない場合は即時リダイレクト
    if (!confirmMessage) {
      // リダイレクト中の表示
      return (
        <div className="flex justify-center items-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    // 確認メッセージがある場合は表示
    return (
      <FallbackContent 
        contentType={contentType}
        contentDescription={contentDescription}
        confirmMessage={confirmMessage}
        redirectTo={redirectTo}
        onRedirect={handleRedirect}
      />
    );
  }
  
  // カスタム表示コンポーネントが指定されている場合はそれを表示
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }
  
  // デフォルトのサブスクリプション促進画面
  return (
    <FallbackContent 
      contentType={contentType}
      contentDescription={contentDescription}
    />
  );
};

export default ContentGuard;
