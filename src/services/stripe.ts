
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/utils/subscriptionPlans';
import { retrySupabaseFunction } from '@/utils/retry';

/**
 * Stripeチェックアウトセッションを作成する
 * @param returnUrl チェックアウト完了後のリダイレクトURL
 * @param planType プランタイプ（standard, growth, communityなど）
 * @param duration プラン期間（1ヶ月または3ヶ月）
 * @param isTest 強制的にテスト環境のPrice IDを使用するかどうか
 */
export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType = 'community',
  duration: 1 | 3 = 1,
  isTest?: boolean
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }
    
    const useTestPrice = isTest || import.meta.env.MODE !== 'production';
    console.log(`Checkout開始: プラン=${planType}, 期間=${duration}ヶ月, 環境=${useTestPrice ? 'テスト' : '本番'}`);
    console.log(`🔍 デバッグ: import.meta.env.MODE = ${import.meta.env.MODE}, useTestPrice = ${useTestPrice}`);

    // リトライ付きでSupabase Edge Functionを呼び出してCheckoutセッションを作成
    const response = await supabase.functions.invoke('create-checkout', {
      body: {
        returnUrl,
        planType,
        duration,
        useTestPrice
      }
    });

    console.log('🔍 Edge Function Response:', response);

    if (response.error) {
      console.error('❌ Checkoutセッション作成エラー:', response.error);
      console.error('❌ Response data:', response.data);
      throw new Error(response.data?.error || response.error.message || '決済処理の準備に失敗しました。');
    }

    const { data, error } = response;

    if (error) {
      console.error('Checkoutセッション作成エラー:', error);
      throw new Error('決済処理の準備に失敗しました。');
    }
    
    console.log('Checkoutセッション作成成功:', data.url);
    
    return { url: data.url, error: null };
  } catch (error) {
    console.error('Stripe決済エラー:', error);
    return { url: null, error: error as Error };
  }
};

/**
 * 購読状態を確認する
 */
export const checkSubscriptionStatus = async (): Promise<{
  isSubscribed: boolean;
  subscribed: boolean; // 後方互換性のため
  planType: PlanType | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  renewalDate: string | null;
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
  error: Error | null;
}> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        isSubscribed: false,
        subscribed: false,
        planType: null,
        duration: null,
        cancelAtPeriodEnd: false,
        cancelAt: null,
        renewalDate: null,
        hasMemberAccess: false,
        hasLearningAccess: false,
        error: null
      };
    }

    // リトライ付きでSupabase Edge Functionを呼び出して購読状態を確認
    const { data, error } = await retrySupabaseFunction(() =>
      supabase.functions.invoke('check-subscription')
    );

    // Edge Functionがエラーを返した場合、または data.error がある場合は直接DBから取得
    if (error || data?.error) {
      console.warn('Edge Functionエラー、直接DBから取得します:', error || data?.error);

      // フォールバック: 直接データベースから購読情報を取得
      const { data: subscription, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, duration, is_active, cancel_at_period_end, cancel_at, current_period_end')
        .eq('user_id', session.user.id)
        .single();

      if (dbError) {
        console.error('DB取得エラー:', dbError);
        throw new Error('購読状態の確認に失敗しました。');
      }

      const isActive = subscription?.is_active || false;
      const planType = subscription?.plan_type as PlanType || null;
      const duration = subscription?.duration || null;
      const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;
      const cancelAt = subscription?.cancel_at || null;
      const currentPeriodEnd = subscription?.current_period_end || null;

      // renewalDate:
      // - キャンセル済み（cancel_at_period_end=true）の場合はcancel_atを使用（利用期限）
      // - 通常のサブスクリプションの場合はcurrent_period_endを使用（次回更新日）
      const renewalDate = cancelAtPeriodEnd && cancelAt ? cancelAt : currentPeriodEnd;

      // アクセス権限を計算
      const hasMemberAccess = isActive && (planType === 'standard' || planType === 'growth' || planType === 'community');
      const hasLearningAccess = isActive && (planType === 'standard' || planType === 'growth');

      console.log('DB直接取得結果:', { isActive, planType, duration, cancelAtPeriodEnd, cancelAt, renewalDate, hasMemberAccess, hasLearningAccess });

      return {
        isSubscribed: isActive,
        subscribed: isActive,
        planType,
        duration,
        cancelAtPeriodEnd,
        cancelAt,
        renewalDate,
        hasMemberAccess,
        hasLearningAccess,
        error: null
      };
    }

    console.log('購読状態確認結果:', data);

    return {
      isSubscribed: data.isSubscribed || data.subscribed,
      subscribed: data.subscribed || data.isSubscribed, // 後方互換性
      planType: data.planType || null,
      duration: data.duration ?? null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
      cancelAt: data.cancelAt || null,
      renewalDate: data.renewalDate || null,
      hasMemberAccess: data.hasMemberAccess || false,
      hasLearningAccess: data.hasLearningAccess || false,
      error: null
    };
  } catch (error) {
    console.error('購読状態確認エラー:', error);
    return {
      isSubscribed: false,
      subscribed: false,
      planType: null,
      duration: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      renewalDate: null,
      hasMemberAccess: false,
      hasLearningAccess: false,
      error: error as Error
    };
  }
};

/**
 * Stripeカスタマーポータルのセッションを作成し、URLを取得する
 * @param returnUrl ポータルから戻る際のリダイレクトURL
 * @param useDeepLink サブスクリプション更新画面に直接遷移するか
 * @returns カスタマーポータルのURL
 */
export const getCustomerPortalUrl = async (returnUrl?: string, useDeepLink?: boolean): Promise<string> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }

    // デフォルトのリターンURLを設定
    const defaultReturnUrl = `${window.location.origin}/account`;

    // リトライ付きでSupabase Edge Functionを呼び出してカスタマーポータルセッションを作成
    const { data, error } = await retrySupabaseFunction(() =>
      supabase.functions.invoke('create-customer-portal', {
        body: {
          returnUrl: returnUrl || defaultReturnUrl,
          useDeepLink: useDeepLink || false
        }
      })
    );

    if (error) {
      console.error('カスタマーポータルセッション作成エラー:', error);
      throw new Error('カスタマーポータルの作成に失敗しました。');
    }

    if (!data || !data.url) {
      throw new Error('カスタマーポータルURLの取得に失敗しました。');
    }

    return data.url;
  } catch (error) {
    console.error('カスタマーポータルURL取得エラー:', error);
    throw error;
  }
};

/**
 * 既存サブスクリプションのプランを変更する
 * @param planType 変更先のプランタイプ
 * @param duration プラン期間（1ヶ月または3ヶ月）
 * @returns 成功/失敗の結果
 */
export const updateSubscription = async (
  planType: PlanType,
  duration: 1 | 3 = 1
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }

    console.log(`プラン変更開始: プラン=${planType}, 期間=${duration}ヶ月`);

    // リトライ付きでSupabase Edge Functionを呼び出してサブスクリプションを更新
    const { data, error } = await retrySupabaseFunction(() =>
      supabase.functions.invoke('update-subscription', {
        body: {
          planType,
          duration
        }
      })
    );

    if (error) {
      console.error('サブスクリプション更新エラー:', error);
      throw new Error('プラン変更に失敗しました。');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'プラン変更に失敗しました。');
    }

    console.log('プラン変更成功:', data);

    return { success: true, error: null };
  } catch (error) {
    console.error('プラン変更エラー:', error);
    return { success: false, error: error as Error };
  }
};
