
import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { checkSubscriptionStatus } from '@/services/stripe';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RegistrationFlowGuide } from '@/components/auth/RegistrationFlowGuide';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
        <LoadingSpinner size="lg" />
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

  // デフォルトのサブスクリプション促進画面（RegistrationFlowGuide使用）
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader className="pb-0" />
      <CardContent>
        <RegistrationFlowGuide variant="modal" showLoginLink />
      </CardContent>
    </Card>
  );
};

export default SubscriptionGuard;
