
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkSubscriptionStatus } from '@/services/stripe';
import { PlanType, hasLearningAccess, hasMemberAccess, UserPlanInfo } from '@/utils/subscriptionPlans';

export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  // 新しいアクセス権限フラグ
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
}

/**
 * サブスクリプション状態を取得・管理するカスタムフック
 */
export const useSubscription = (): SubscriptionState => {
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setIsSubscribed(false);
      setPlanType(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { isSubscribed, planType, error } = await checkSubscriptionStatus();
      
      if (error) {
        throw error;
      }
      
      setIsSubscribed(isSubscribed);
      setPlanType(planType);
      setError(null);
    } catch (err) {
      console.error('サブスクリプション取得エラー:', err);
      setError(err instanceof Error ? err : new Error('サブスクリプション情報の取得に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchSubscriptionStatus();
    }
  }, [user, authLoading]);

  // ユーザープラン情報を作成
  const userPlan: UserPlanInfo = {
    planType,
    isActive: isSubscribed,
  };

  // 新しいヘルパー関数を使用してアクセス権限を計算
  const memberAccess = hasMemberAccess(userPlan);
  const learningAccess = hasLearningAccess(userPlan);

  return {
    isSubscribed,
    planType,
    loading,
    error,
    refresh: fetchSubscriptionStatus,
    hasMemberAccess: memberAccess,
    hasLearningAccess: learningAccess
  };
};
