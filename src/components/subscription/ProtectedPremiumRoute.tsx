
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionGuard from './SubscriptionGuard';

interface ProtectedPremiumRouteProps {
  children: React.ReactNode;
  /**
   * 非ログイン時のリダイレクト先
   * デフォルト: "/auth"
   */
  authRedirectPath?: string;
  /**
   * サブスクリプションがない場合のリダイレクト先
   * 指定がない場合はSubscriptionGuardのデフォルトUIを表示
   */
  subscriptionRedirectPath?: string;
}

/**
 * 認証状態とサブスクリプション状態の両方をチェックするルートコンポーネント
 * 1. ログインしていない場合 → ログインページにリダイレクト
 * 2. ログイン済みだがサブスクリプションがない場合 → サブスクリプション登録を促す
 * 3. ログイン済みかつサブスクリプション有効な場合 → コンテンツを表示
 */
const ProtectedPremiumRoute: React.FC<ProtectedPremiumRouteProps> = ({
  children,
  authRedirectPath = "/auth",
  subscriptionRedirectPath
}) => {
  const { user, loading } = useAuth();

  // 認証状態確認中はローディング表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ログインしていない場合は認証ページにリダイレクト
  if (!user) {
    return <Navigate to={authRedirectPath} state={{ from: window.location.pathname }} replace />;
  }

  // ユーザーはログイン済み、サブスクリプション状態をチェック
  return (
    <SubscriptionGuard redirectTo={subscriptionRedirectPath}>
      {children}
    </SubscriptionGuard>
  );
};

export default ProtectedPremiumRoute;
