
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession } from '@/services/stripe';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { PlanType, AVAILABLE_PLANS, getPlanBenefits } from '@/utils/subscriptionPlans';

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
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">サブスクリプションプラン</h1>
          <p className="text-muted-foreground">
            あなたに合ったプランを選んで、コンテンツやサービスをフル活用しましょう
          </p>
          {isSubscribed && (
            <div className="mt-4">
              <Badge variant="outline" className="text-md py-1 px-3 bg-green-50 text-green-700 border-green-300">
                現在のプラン: {getCurrentPlanName()}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = isSubscribed && planType === plan.id;
            const planBenefits = getPlanBenefits(plan.id as PlanType);
            
            return (
              <Card 
                key={plan.id} 
                className={`
                  flex flex-col
                  ${plan.recommended ? 'border-primary shadow-lg relative' : ''}
                  ${isCurrentPlan ? 'border-green-500' : ''}
                `}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-white px-3 py-1">おすすめ</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-green-500 text-white px-3 py-1">現在のプラン</Badge>
                  </div>
                )}
                <CardHeader className={plan.recommended ? 'pt-8' : ''}>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2 mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {planBenefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        className={`w-full ${plan.recommended ? 'bg-primary' : ''}`}
                        disabled={isLoading || isCurrentPlan}
                        onClick={() => handleSubscribe(plan.id as PlanType)}
                      >
                        {isCurrentPlan ? '現在のプラン' : '選択する'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">プラン比較</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">機能</th>
                  <th className="text-center py-3">スタンダード</th>
                  <th className="text-center py-3">グロース</th>
                  <th className="text-center py-3">コミュニティ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">基本学習コンテンツ</td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">メンバー限定コンテンツ</td>
                  <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">トレーニングプログラム</td>
                  <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">コミュニティアクセス</td>
                  <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
