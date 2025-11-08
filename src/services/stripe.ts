
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/utils/subscriptionPlans';

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
    
    console.log(`Checkout開始: プラン=${planType}, 期間=${duration}ヶ月, 環境=${isTest ? 'テスト' : '本番'}`);
    
    // Supabase Edge Functionを呼び出してCheckoutセッションを作成
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        returnUrl,
        planType,
        duration,
        useTestPrice: isTest || import.meta.env.MODE !== 'production' 
      }
    });
    
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
        hasMemberAccess: false,
        hasLearningAccess: false,
        error: null
      };
    }

    // Supabase Edge Functionを呼び出して購読状態を確認
    const { data, error } = await supabase.functions.invoke('check-subscription');

    // Edge Functionがエラーを返した場合、または data.error がある場合は直接DBから取得
    if (error || data?.error) {
      console.warn('Edge Functionエラー、直接DBから取得します:', error || data?.error);

      // フォールバック: 直接データベースから購読情報を取得
      const { data: subscription, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, is_active')
        .eq('user_id', session.user.id)
        .single();

      if (dbError) {
        console.error('DB取得エラー:', dbError);
        throw new Error('購読状態の確認に失敗しました。');
      }

      const isActive = subscription?.is_active || false;
      const planType = subscription?.plan_type as PlanType || null;

      // アクセス権限を計算
      const hasMemberAccess = isActive && (planType === 'standard' || planType === 'growth' || planType === 'community');
      const hasLearningAccess = isActive && (planType === 'standard' || planType === 'growth');

      console.log('DB直接取得結果:', { isActive, planType, hasMemberAccess, hasLearningAccess });

      return {
        isSubscribed: isActive,
        subscribed: isActive,
        planType,
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
      hasMemberAccess: false,
      hasLearningAccess: false,
      error: error as Error
    };
  }
};

/**
 * Stripeカスタマーポータルのセッションを作成し、URLを取得する
 * @param returnUrl ポータルから戻る際のリダイレクトURL
 * @returns カスタマーポータルのURL
 */
export const getCustomerPortalUrl = async (returnUrl?: string): Promise<string> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }

    // デフォルトのリターンURLを設定
    const defaultReturnUrl = `${window.location.origin}/account`;

    // Supabase Edge Functionを呼び出してカスタマーポータルセッションを作成
    const { data, error } = await supabase.functions.invoke('create-customer-portal', {
      body: { returnUrl: returnUrl || defaultReturnUrl }
    });

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

    // Supabase Edge Functionを呼び出してサブスクリプションを更新
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: {
        planType,
        duration
      }
    });

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
