
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession } from '@/services/stripe';
import { PlanType } from '@/utils/subscriptionPlans';
import PlanCard from '@/components/subscription/PlanCard';
import PlanComparison from '@/components/subscription/PlanComparison';
import SubscriptionHeader from '@/components/subscription/SubscriptionHeader';

const SubscriptionPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubscribed, planType } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // 料金プラン情報
  const plans = [
    {
      id: 'standard',
      name: 'スタンダード',
      description: '基本的な学習コンテンツへのアクセス',
      price: '4,000円/月',
      features: {
        learning: true,
        member: false,
        training: false
      },
      recommended: false
    },
    {
      id: 'growth',
      name: 'グロース',
      description: '全ての機能とコンテンツへのアクセス',
      price: '9,800円/月',
      features: {
        learning: true,
        member: true,
        training: true
      },
      recommended: true
    },
    {
      id: 'community',
      name: 'コミュニティ',
      description: 'メンバーコミュニティへの参加',
      price: '1,480円/月',
      features: {
        learning: true,
        member: true,
        training: false
      },
      recommended: false
    }
  ];

  const handleSubscribe = async (selectedPlanType: PlanType) => {
    setIsLoading(true);
    try {
      // ユーザーの現在地を保存し、チェックアウト後に戻れるようにする
      const returnUrl = window.location.origin + '/subscription/success';
      
      const { url, error } = await createCheckoutSession(returnUrl);
      
      if (error) {
        throw error;
      }
      
      if (url) {
        // Stripeチェックアウトページにリダイレクト
        window.location.href = url;
      }
    } catch (error) {
      console.error('購読エラー:', error);
      toast({
        title: "エラーが発生しました",
        description: "決済処理の開始に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 現在のプランを取得
  const getCurrentPlanName = () => {
    if (!isSubscribed || !planType) return 'フリープラン';
    
    const planMap: Record<PlanType, string> = {
      standard: 'スタンダード',
      growth: 'グロース',
      community: 'コミュニティ'
    };
    
    return planMap[planType] || 'フリープラン';
  };
  
  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <SubscriptionHeader 
          isSubscribed={isSubscribed} 
          currentPlanName={getCurrentPlanName()} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = isSubscribed && planType === plan.id;
            
            return (
              <PlanCard 
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                features={plan.features}
                recommended={plan.recommended}
                isCurrentPlan={isCurrentPlan}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
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
