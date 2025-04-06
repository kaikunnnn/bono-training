
import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { checkSubscriptionStatus } from '@/services/stripe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
  /**
   * サブスクリプションがない場合のリダイレクト先
   * 指定がない場合はその場でサブスクリプション登録画面を表示
   */
  redirectTo?: string;
  /**
   * カスタムの非サブスクライバー表示コンポーネント
   */
  fallbackComponent?: React.ReactNode;
}

/**
 * サブスクリプション状態に基づいてコンテンツアクセスを制御するコンポーネント
 * 有効なサブスクリプションを持つユーザーのみが子コンポーネントにアクセスできる
 */
const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  redirectTo,
  fallbackComponent
}) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      setLoading(true);
      try {
        const { isSubscribed, error } = await checkSubscriptionStatus();
        
        if (error) {
          throw error;
        }
        
        setIsSubscribed(isSubscribed);
        
        // リダイレクト指定があり、サブスクリプションがない場合はリダイレクト
        if (!isSubscribed && redirectTo) {
          navigate(redirectTo);
        }
      } catch (error) {
        console.error('サブスクリプション状態確認エラー:', error);
        toast({
          title: "エラー",
          description: "サブスクリプション状態の確認中にエラーが発生しました",
          variant: "destructive",
        });
        // エラーの場合はアクセスを拒否
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkSubscription();
  }, [redirectTo, navigate, toast]);

  // ローディング中は読み込み表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // サブスクリプションがある場合は子コンポーネントを表示
  if (isSubscribed) {
    return <>{children}</>;
  }

  // カスタム表示コンポーネントが指定されている場合はそれを表示
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // デフォルトのサブスクリプション促進画面
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-center">メンバーシップが必要です</CardTitle>
        <CardDescription className="text-center">
          このコンテンツはメンバー限定です。サブスクリプションに登録して、すべてのコンテンツにアクセスしましょう。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              すべてのプレミアムコンテンツへのアクセス
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              限定機能の利用
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              優先サポート
            </div>
          </div>

          <SubscriptionButton returnUrl={window.location.href} label="メンバーシップに登録する" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionGuard;
