
import { supabase } from '@/integrations/supabase/client';
import { getCheckoutLineItems } from '@/utils/stripe';

/**
 * Stripeチェックアウトセッションを作成する
 * @param returnUrl チェックアウト完了後のリダイレクトURL
 * @param isTest 強制的にテスト環境のPrice IDを使用するかどうか
 */
export const createCheckoutSession = async (
  returnUrl: string,
  isTest?: boolean
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }
    
    // Supabase Edge Functionを呼び出してCheckoutセッションを作成
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        returnUrl,
        useTestPrice: isTest || process.env.NODE_ENV !== 'production' 
      }
    });
    
    if (error) {
      console.error('Checkoutセッション作成エラー:', error);
      throw new Error('決済処理の準備に失敗しました。');
    }
    
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
  error: Error | null;
}> => {
  try {
    // ユーザーが認証済みか確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { isSubscribed: false, error: null };
    }
    
    // Supabase Edge Functionを呼び出して購読状態を確認
    const { data, error } = await supabase.functions.invoke('check-subscription');
    
    if (error) {
      console.error('購読状態確認エラー:', error);
      throw new Error('購読状態の確認に失敗しました。');
    }
    
    return { isSubscribed: data.subscribed, error: null };
  } catch (error) {
    console.error('購読状態確認エラー:', error);
    return { isSubscribed: false, error: error as Error };
  }
};
