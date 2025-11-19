
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkSubscriptionStatus } from '@/services/stripe';
import { PlanType, hasLearningAccess, hasMemberAccess, UserPlanInfo } from '@/utils/subscriptionPlans';
import { canAccessContent as canAccessContentUtil } from '@/utils/premiumAccess';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  renewalDate: string | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  // アクセス権限フラグ
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
  // プレミアムコンテンツアクセス判定
  canAccessContent: (isPremium: boolean) => boolean;
}

/**
 * サブスクリプション状態を取得・管理するカスタムフック
 */
export const useSubscription = (): SubscriptionState => {
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [cancelAt, setCancelAt] = useState<string | null>(null);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [memberAccess, setMemberAccess] = useState(false);
  const [learningAccess, setLearningAccess] = useState(false);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setIsSubscribed(false);
      setPlanType(null);
      setDuration(null);
      setCancelAtPeriodEnd(false);
      setCancelAt(null);
      setRenewalDate(null);
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
      
      // レスポンスから値を安全に取得
      const subscribed = response.isSubscribed ?? response.subscribed ?? false;
      const plan = response.planType;
      const dur = response.duration ?? null;
      const cancelPending = response.cancelAtPeriodEnd ?? false;
      const cancelDate = response.cancelAt ?? null;
      const renewal = response.renewalDate ?? null;

      setIsSubscribed(subscribed);
      setPlanType(plan);
      setDuration(dur);
      setCancelAtPeriodEnd(cancelPending);
      setCancelAt(cancelDate);
      setRenewalDate(renewal);
      
      // Edge Functionから直接アクセス権限が取得できる場合はそれを優先使用
      if (response.hasMemberAccess !== undefined && response.hasLearningAccess !== undefined) {
        console.log('Edge Functionから取得したアクセス権限を使用:', {
          hasMemberAccess: response.hasMemberAccess,
          hasLearningAccess: response.hasLearningAccess,
          planType: plan
        });
        setMemberAccess(response.hasMemberAccess);
        setLearningAccess(response.hasLearningAccess);
      } else {
        // フォールバック: ローカルで計算（Edge Functionの更新が完了していない場合）
        console.log('フォールバック: ローカルでアクセス権限を計算:', { planType: plan, subscribed });
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

  // Realtime Subscription: user_subscriptionsテーブルの変更を監視
  useEffect(() => {
    if (!user) return;

    console.log('Realtime Subscriptionを設定:', { userId: user.id });

    const channel = supabase
      .channel('user_subscriptions_changes')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('サブスクリプション更新を検知:', payload);
          // DB変更時に即座に状態を更新
          fetchSubscriptionStatus();
        }
      )
      .subscribe((status) => {
        console.log('Realtime Subscription status:', status);
      });

    return () => {
      console.log('Realtime Subscriptionをクリーンアップ');
      channel.unsubscribe();
    };
  }, [user]);

  return {
    isSubscribed,
    planType,
    duration,
    cancelAtPeriodEnd,
    cancelAt,
    renewalDate,
    loading,
    error,
    refresh: fetchSubscriptionStatus,
    hasMemberAccess: memberAccess,
    hasLearningAccess: learningAccess,
    canAccessContent: (isPremium: boolean) => canAccessContentUtil(isPremium, planType)
  };
};
