import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { SubscriptionSuccessContent } from '@/components/subscription/SubscriptionSuccessContent';
import { trackSubscriptionStart, trackPurchase } from '@/lib/analytics';

const SubscriptionSuccess: React.FC = () => {
  const { refresh, planType, duration } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // チェックアウト完了後、Webhookが処理されるまで少し待機
    const refreshSubscription = async () => {
      try {
        // 2秒待機してWebhookの処理を待つ
        await new Promise(resolve => setTimeout(resolve, 2000));

        // サブスクリプション情報をリフレッシュ
        await refresh();

        setIsLoading(false);
      } catch (err) {
        console.error('サブスクリプション情報の更新エラー:', err);
        setError('サブスクリプション情報の取得に失敗しました');
        setIsLoading(false);
      }
    };

    refreshSubscription();
  }, [refresh]);

  // GAイベント送信（サブスクリプション情報が取得できたら）
  // sessionStorageで重複送信を防止（リロード対策）
  useEffect(() => {
    if (!isLoading && planType && duration) {
      const purchaseKey = `ga_purchase_sent_${planType}_${duration}`;
      if (sessionStorage.getItem(purchaseKey)) {
        return; // 既に送信済み
      }

      // プラン料金のマッピング
      const planPriceMap: Record<string, number> = {
        'standard-1': 4000,
        'standard-3': 3800,
        'feedback-1': 1480,
        'feedback-3': 1280,
      };

      const planKey = `${planType}-${duration}`;
      const monthlyPrice = planPriceMap[planKey] || 0;
      const transactionId = `sub_${planType}_${duration}_${Date.now()}`;

      // サブスクリプション開始イベントを送信（後方互換）
      trackSubscriptionStart(planType, monthlyPrice * duration);

      // GA4推奨: purchaseイベント（Monetizationレポート対応）
      trackPurchase({
        planType: planType,
        price: monthlyPrice * duration,
        duration: duration,
        transactionId: transactionId,
      });

      sessionStorage.setItem(purchaseKey, transactionId);
    }
  }, [isLoading, planType, duration]);

  return (
    <Layout>
      <SubscriptionSuccessContent
        type="new"
        planType={planType}
        duration={duration}
        isLoading={isLoading}
        error={error}
      />
    </Layout>
  );
};

export default SubscriptionSuccess;
