import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { SubscriptionSuccessContent } from '@/components/subscription/SubscriptionSuccessContent';
import { PlanType } from '@/utils/subscriptionPlans';

const SubscriptionUpdated: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refresh, planType: currentPlanType } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータから更新後のプラン情報を取得
  const updatedPlanType = searchParams.get('plan') as PlanType | null;
  const updatedDuration = searchParams.get('duration');
  const displayPlanType = updatedPlanType || currentPlanType;
  const displayDuration = updatedDuration ? (parseInt(updatedDuration, 10) as 1 | 3) : null;

  useEffect(() => {
    // プラン変更完了後、データをリフレッシュ
    const refreshSubscription = async () => {
      try {
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
        type="updated"
        planType={displayPlanType}
        duration={displayDuration}
        isLoading={isLoading}
        error={error}
      />
    </Layout>
  );
};

export default SubscriptionUpdated;
