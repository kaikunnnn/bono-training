
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
  const [memberAccess, setMemberAccess] = useState(false);
  const [learningAccess, setLearningAccess] = useState(false);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setIsSubscribed(false);
      setPlanType(null);
      setMemberAccess(false);
      setLearningAccess(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await checkSubscriptionStatus();
      
      if (response.error) {
        throw response.error;
      }
      
      // Edge Functionからのレスポンスに hasMemberAccess, hasLearningAccess が含まれている場合はそれを使用
      const subscribed = response.isSubscribed ?? response.subscribed;
      const plan = response.planType;
      const memberAccessFromResponse = response.hasMemberAccess;
      const learningAccessFromResponse = response.hasLearningAccess;
      
      setIsSubscribed(subscribed);
      setPlanType(plan);
      
      // Edge Functionから直接アクセス権限が取得できる場合はそれを使用
      if (memberAccessFromResponse !== undefined && learningAccessFromResponse !== undefined) {
        setMemberAccess(memberAccessFromResponse);
        setLearningAccess(learningAccessFromResponse);
      } else {
        // フォールバック: ローカルで計算
        const userPlan: UserPlanInfo = {
          planType: plan,
          isActive: subscribed,
        };
        setMemberAccess(hasMemberAccess(userPlan));
        setLearningAccess(hasLearningAccess(userPlan));
      }
      
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
