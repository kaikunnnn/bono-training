
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/services/stripe';
import { getCurrentPlan } from '@/utils/stripe';

interface SubscriptionButtonProps {
  /**
   * 購読プロセス完了後のリダイレクトURL
   * 指定しない場合は現在のURLに戻る
   */
  returnUrl?: string;
  /**
   * ボタンラベル
   */
  label?: string;
  /**
   * isTest - テスト環境のPrice IDを強制的に使用するかどうか
   */
  isTest?: boolean;
}

/**
 * サブスクリプション購入ボタンコンポーネント
 */
export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ 
  returnUrl,
  label = '購読を開始する',
  isTest = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // 現在のURLをデフォルトのリターンURLとして使用
      const defaultReturnUrl = window.location.href;
      const finalReturnUrl = returnUrl || defaultReturnUrl;
      
      // チェックアウトセッションを作成
      const { url, error } = await createCheckoutSession(finalReturnUrl, isTest);
      
      if (error || !url) {
        throw new Error(error?.message || '決済処理の準備に失敗しました');
      }
      
      // Stripeのチェックアウトページにリダイレクト
      window.location.href = url;
    } catch (error) {
      console.error('購読処理エラー:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : '購読処理中にエラーが発生しました',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const plan = getCurrentPlan(isTest);
  
  return (
    <Button 
      onClick={handleSubscribe} 
      disabled={loading}
      className="w-full"
    >
      {loading ? 'お待ちください...' : `${label} (${plan.amount}${plan.currency === 'jpy' ? '円' : plan.currency}/${plan.interval === 'month' ? '月' : '年'})`}
    </Button>
  );
};

export default SubscriptionButton;
