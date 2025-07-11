
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
    
    if (error) {
      console.error('購読状態確認エラー:', error);
      throw new Error('購読状態の確認に失敗しました。');
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
