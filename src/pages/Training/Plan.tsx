
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession } from '@/services/stripe';
import { PlanType } from '@/utils/subscriptionPlans';
import PlanCard from '@/components/subscription/PlanCard';

const TrainingPlan: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubscribed, planType, planMembers } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // コミュニティプラン情報
  const communityPlan = {
    id: 'community',
    name: 'コミュニティプラン',
    description: 'トレーニングの全コンテンツにアクセス可能',
    price: '1,480円/月',
    features: {
      learning: true,
      member: true,
      training: false
    },
    recommended: true
  };
  
  const handleSubscribe = async (selectedPlanType: PlanType) => {
    setIsLoading(true);
    try {
      // チェックアウト後に戻るURLを指定
      const returnUrl = window.location.origin + '/profile';
      
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
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">トレーニングプラン</h1>
          <p className="text-lg text-gray-600">
            BONOトレーニングの全コンテンツにアクセスして、実践的なスキルを身につけましょう
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
          {/* コミュニティプランカード */}
          <PlanCard 
            id={communityPlan.id}
            name={communityPlan.name}
            description={communityPlan.description}
            price={communityPlan.price}
            features={communityPlan.features}
            recommended={communityPlan.recommended}
            isCurrentPlan={isSubscribed && planType === 'community' && planMembers}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
          />
        </div>
        
        <div className="mt-12 bg-gray-50 border border-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3">メンバーシッププランの特典</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              すべてのトレーニングコンテンツへのアクセス
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              コミュニティへの参加権限
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              プレミアム教材の閲覧
            </li>
          </ul>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>* 会員期間中はいつでも解約可能です</p>
            <p>* 支払いはStripeの安全な決済システムを利用します</p>
          </div>
        </div>
        
        {isSubscribed && planType && <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            プロフィールページに戻る
          </Button>
        </div>}
      </div>
    </TrainingLayout>
  );
};

export default TrainingPlan;
