
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkSubscriptionStatus } from '@/services/stripe';
import { PlanType } from '@/utils/subscriptionPlans';

export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  loading: boolean;
  error: Error | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    planType: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setState({ isSubscribed: false, planType: null, loading: false, error: null });
        return;
      }

      try {
        const { isSubscribed, planType, error } = await checkSubscriptionStatus();
        if (error) throw error;
        
        setState({
          isSubscribed,
          planType,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('サブスクリプション状態確認エラー:', error);
        setState({
          isSubscribed: false,
          planType: null,
          loading: false,
          error: error instanceof Error ? error : new Error('不明なエラーが発生しました')
        });
      }
    };

    // ユーザー情報が変更されたときにサブスクリプション状態を確認
    checkSubscription();

    // 定期的にサブスクリプション状態を更新（オプション）
    const intervalId = setInterval(checkSubscription, 60000); // 1分ごとに更新

    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  return state;
};
