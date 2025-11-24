
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession, getCustomerPortalUrl } from '@/services/stripe';
import { PlanType } from '@/utils/subscriptionPlans';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlanCard from '@/components/subscription/PlanCard';
import PlanComparison from '@/components/subscription/PlanComparison';
import SubscriptionHeader from '@/components/subscription/SubscriptionHeader';
import { formatPlanDisplay } from '@/utils/planDisplay';

const SubscriptionPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubscribed, planType, duration: currentDuration } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<1 | 3>(1); // 期間選択の状態
  
  // 料金プラン情報（.envに合わせて修正）
  const plans = [
    {
      id: 'standard',
      name: 'スタンダード',
      description: '全てのコンテンツにアクセスできる基本プラン',
      durations: [
        { months: 1, price: 4000, priceLabel: '4,000円/月' },
        { months: 3, price: 3800, priceLabel: '3,800円/月（3ヶ月）' }
      ],
      features: {
        learning: true,
        member: true,
        training: true
      },
      recommended: false
    },
    {
      id: 'feedback',
      name: 'フィードバック',
      description: '全コンテンツ + フィードバック機能が利用できるプラン',
      durations: [
        { months: 1, price: 1480, priceLabel: '1,480円/月' },
        { months: 3, price: 1280, priceLabel: '1,280円/月（3ヶ月）' }
      ],
      features: {
        learning: true,
        member: true,
        training: true
      },
      recommended: true
    }
  ];

  const handleSubscribe = async (selectedPlanType: PlanType) => {
    setIsLoading(true);
    try {
      // 既存契約者かどうかで分岐
      if (isSubscribed) {
        // 既存契約者 → Customer Portalに遷移（標準モード）
        console.log('既存契約者: Customer Portalに遷移します', {
          currentPlan: planType,
          currentDuration: currentDuration,
          selectedPlan: selectedPlanType,
          selectedDuration: selectedDuration
        });

        const returnUrl = window.location.origin + '/subscription';
        // Deep Link モード: 選択されたプラン情報を渡す
        const portalUrl = await getCustomerPortalUrl(returnUrl, selectedPlanType, selectedDuration);

        if (portalUrl) {
          window.location.href = portalUrl;
        }
      } else {
        // 新規ユーザー → Checkoutに遷移
        console.log('新規ユーザー: Checkoutに遷移します', {
          planType: selectedPlanType,
          duration: selectedDuration
        });

        const returnUrl = window.location.origin + '/subscription/success';
        const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);

        if (error) {
          throw error;
        }

        if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error('購読エラー:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "処理の開始に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // formatPlanDisplayをimportして使用するため、getCurrentPlanName関数は不要
  
  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <SubscriptionHeader
          isSubscribed={isSubscribed}
          currentPlanName={formatPlanDisplay(planType, currentDuration)}
        />

        {/* 期間選択タブ（ページ全体） */}
        <div className="flex justify-center mb-8">
          <Tabs
            value={selectedDuration.toString()}
            onValueChange={(value) => setSelectedDuration(Number(value) as 1 | 3)}
            className="w-auto"
          >
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="1" className="font-noto-sans-jp">
                1ヶ月
              </TabsTrigger>
              <TabsTrigger value="3" className="font-noto-sans-jp">
                3ヶ月
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            // 現在のプランと完全に一致する場合のみ「現在のプラン」と判定
            // プランタイプと期間の両方が一致する必要がある
            const isCurrentPlan = isSubscribed &&
                                  planType === plan.id &&
                                  currentDuration === selectedDuration;
            const selectedPriceInfo = plan.durations.find(d => d.months === selectedDuration) || plan.durations[0];

            return (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                price={selectedPriceInfo.price}
                priceLabel={selectedPriceInfo.priceLabel}
                duration={selectedDuration}
                features={plan.features}
                recommended={plan.recommended}
                isCurrentPlan={isCurrentPlan}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
                isSubscribed={isSubscribed}
              />
            );
          })}
        </div>

        <PlanComparison />
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
