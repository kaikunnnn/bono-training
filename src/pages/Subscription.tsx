
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton';
import { checkSubscriptionStatus } from '@/services/stripe';
import { getCurrentPlan } from '@/utils/stripe';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const plan = getCurrentPlan();
  
  useEffect(() => {
    const checkSubscription = async () => {
      setLoading(true);
      try {
        const { isSubscribed, error } = await checkSubscriptionStatus();
        if (error) {
          throw error;
        }
        setIsSubscribed(isSubscribed);
      } catch (error) {
        console.error('購読状態確認エラー:', error);
        toast({
          title: "エラー",
          description: "購読状態の確認中にエラーが発生しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkSubscription();
  }, [toast]);
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">サブスクリプションプラン</h1>
        
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : isSubscribed ? (
          <Card>
            <CardHeader>
              <CardTitle>アクティブなサブスクリプション</CardTitle>
              <CardDescription>
                すでにプレミアムプランを購読中です
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="mb-4">プレミアム機能がすべて利用可能です。</p>
                <Button onClick={() => navigate('/')}>ダッシュボードへ戻る</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-3xl font-bold">{plan.amount}</span>
                <span className="text-lg">円/月</span>
                <p className="text-muted-foreground mt-2">いつでもキャンセル可能</p>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  すべての機能へのアクセス
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  優先サポート
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  高度な分析機能
                </li>
              </ul>
              
              <SubscriptionButton />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
