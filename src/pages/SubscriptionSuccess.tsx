import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { SubscriptionSuccessContent } from '@/components/subscription/SubscriptionSuccessContent';

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
