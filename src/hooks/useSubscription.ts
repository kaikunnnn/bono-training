
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkSubscriptionStatus } from '@/services/stripe';
import { PlanType } from '@/utils/subscriptionPlans';

export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  planMembers: boolean; // トレーニングメンバーシップのアクセス権限
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * サブスクリプション状態を取得・管理するカスタムフック
 */
export const useSubscription = (): SubscriptionState => {
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [planMembers, setPlanMembers] = useState(false); // メンバーシップアクセス権限
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setIsSubscribed(false);
      setPlanType(null);
      setPlanMembers(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { isSubscribed, planType, planMembers, error } = await checkSubscriptionStatus();
      
      if (error) {
        throw error;
      }
      
      setIsSubscribed(isSubscribed);
      setPlanType(planType);
      setPlanMembers(planMembers);
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
    planMembers,
    loading,
    error,
    refresh: fetchSubscriptionStatus
  };
};
