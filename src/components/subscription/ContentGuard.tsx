
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentAccessType, hasAccessToContent, UserPlanInfo } from '@/utils/subscriptionPlans';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Star, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentGuardProps {
  children: ReactNode;
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
  const { toast } = useToast();
  const { isSubscribed, planType } = useSubscriptionContext();
  
  // サブスクリプション情報からユーザープラン情報を作成
  const userPlan: UserPlanInfo = {
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
              <Button
                onClick={handleRedirect}
              >
                プラン選択へ
              </Button>
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
          {getContentTypeDescription(contentType, contentDescription)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <FeatureList contentType={contentType} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white flex-grow" 
              asChild
            >
              <Link to="/subscription">メンバーに登録する</Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-grow">
              <Link to="/pricing">料金プランを見る</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// コンテンツタイプに応じた説明を返す
function getContentTypeDescription(contentType: ContentAccessType, customDescription?: string): string {
  if (customDescription) return customDescription;
  
  switch (contentType) {
    case 'learning':
      return 'この学習コンテンツを閲覧するには、プランのアップグレードが必要です。';
    case 'member':
      return 'このメンバー限定コンテンツを閲覧するには、プランのアップグレードが必要です。';
    case 'training':
      return 'このトレーニングプログラムに参加するには、グロースプランへのアップグレードが必要です。';
    default:
      return 'このコンテンツを閲覧するには、プランのアップグレードが必要です。';
  }
}

// コンテンツタイプに応じた機能リストを表示
function FeatureList({ contentType }: { contentType: ContentAccessType }) {
  const features = getFeaturesByContentType(contentType);
  
  return (
    <>
      {features.map((feature, index) => (
        <div key={index} className="flex items-center">
          <Star className="h-5 w-5 text-amber-500 mr-2" />
          {feature}
        </div>
      ))}
    </>
  );
}

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
        '追加機能の利用',
        'コミュニティへの参加'
      ];
    case 'training':
      return [
        '全てのトレーニングプログラムへのアクセス',
        '実践的なスキル習得カリキュラム',
        'ハンズオンでの技術習得',
        'プロジェクト例と解説'
      ];
    default:
      return [
        'プレミアムコンテンツへのアクセス',
        '追加機能の利用',
        'プレミアムサポート'
      ];
  }
}

export default ContentGuard;
