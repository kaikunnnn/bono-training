
import { supabase } from '@/integrations/supabase/client';
import { getCheckoutLineItems } from '@/utils/stripe';
import { PlanType } from '@/utils/subscriptionPlans';

/**
 * Stripeチェックアウトセッションを作成する
 * @param returnUrl チェックアウト完了後のリダイレクトURL
 * @param planType プランタイプ（standard, growth, communityなど）
 * @param isTest 強制的にテスト環境のPrice IDを使用するかどうか
 */
export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType = 'standard',
  isTest?: boolean
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }
    
    console.log(`Checkout開始: プラン=${planType}, 環境=${isTest ? 'テスト' : '本番'}`);
    
    // Supabase Edge Functionを呼び出してCheckoutセッションを作成
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        returnUrl,
        planType,
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
  planType: PlanType | null;
  error: Error | null;
}> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { isSubscribed: false, planType: null, error: null };
    }
    
    // Supabase Edge Functionを呼び出して購読状態を確認
    const { data, error } = await supabase.functions.invoke('check-subscription');
    
    if (error) {
      console.error('購読状態確認エラー:', error);
      throw new Error('購読状態の確認に失敗しました。');
    }
    
    console.log('購読状態確認結果:', data);
    
    return { 
      isSubscribed: data.subscribed, 
      planType: data.planType || null,
      error: null 
    };
  } catch (error) {
    console.error('購読状態確認エラー:', error);
    return { isSubscribed: false, planType: null, error: error as Error };
  }
};
