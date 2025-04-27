
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionButton from '@/components/subscription/SubscriptionButton';
import { ContentAccessType, hasAccessToContent } from '@/utils/subscriptionPlans';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

interface ContentGuardProps {
  children: ReactNode;
  /**
   * コンテンツタイプ（'learning' または 'member'）
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
}

/**
 * プランに応じてコンテンツを表示するガードコンポーネント
 */
const ContentGuard: React.FC<ContentGuardProps> = ({
  children,
  contentType,
  redirectTo,
  fallbackComponent,
  confirmMessage
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSubscribed, planType } = useSubscriptionContext();
  
  // サブスクリプション情報からユーザープラン情報を作成
  const userPlan = {
    planType,
    isActive: isSubscribed,
  };
  
  // コンテンツへのアクセス権があるかチェック
  const hasAccess = hasAccessToContent(userPlan, contentType);
  
  // アクセス権があれば子コンポーネントを表示
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // リダイレクト処理
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
    
    // 即時リダイレクト（確認メッセージがない場合）
    if (!confirmMessage) {
      React.useEffect(() => {
        handleRedirect();
      }, []);
    }
    
    // 確認メッセージがある場合は表示
    if (confirmMessage) {
      return (
        <Card className="max-w-md mx-auto my-8">
          <CardHeader>
            <CardTitle className="text-center">アクセス制限</CardTitle>
            <CardDescription className="text-center">
              このコンテンツを閲覧するには、より上位のプランが必要です。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{confirmMessage}</p>
            <div className="flex space-x-4">
              <button
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={handleRedirect}
              >
                プラン選択へ
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // リダイレクト中の表示
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // カスタム表示コンポーネントが指定されている場合はそれを表示
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }
  
  // デフォルトのサブスクリプション促進画面
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-center">プランのアップグレードが必要です</CardTitle>
        <CardDescription className="text-center">
          {contentType === 'learning' ? 'この学習コンテンツ' : 'このメンバー限定コンテンツ'}を閲覧するには、
          プランのアップグレードが必要です。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {contentType === 'learning' ? '全ての学習コンテンツへのアクセス' : '全てのメンバー限定コンテンツへのアクセス'}
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              追加機能の利用
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              プレミアムサポート
            </div>
          </div>

          <SubscriptionButton returnUrl={window.location.href} label="プランをアップグレードする" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentGuard;
