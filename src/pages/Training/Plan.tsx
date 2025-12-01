import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrainingLayout from '@/components/training/TrainingLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession } from '@/services/stripe';
import { savePlanSession } from '@/utils/planSession';
import { Check } from 'lucide-react';

const TrainingPlan: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, planType, hasMemberAccess } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<1 | 3>(1);
  
  // コミュニティプラン情報
  const communityPlans = [
    {
      duration: 1,
      price: '1,480円/月',
      totalPrice: '1,480円',
      description: '月額プラン',
      savings: null
    },
    {
      duration: 3,
      price: '1,280円/月',
      totalPrice: '3,840円',
      description: '3ヶ月プラン',
      savings: '600円お得'
    }
  ];
  
  const currentPlan = communityPlans.find(p => p.duration === selectedDuration);
  
  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      // TODO: このページは「コミュニティプラン」を販売していますが、
      // PlanTypeには'community'が存在しません（'standard'と'feedback'のみ）。
      // 一時的に'standard'を使用していますが、このページの扱いを再検討する必要があります。
      // プラン情報をセッションに保存
      const planSessionData = {
        planType: 'standard' as const,
        duration: selectedDuration,
        price: currentPlan?.price || ''
      };
      
      const sessionSaved = savePlanSession(planSessionData);
      if (!sessionSaved) {
        throw new Error('プラン情報の保存に失敗しました');
      }

      // 未ログインユーザーの場合は signup ページにリダイレクト
      if (!user) {
        console.log('未ログインユーザー: signup ページにリダイレクト');
        toast({
          title: "アカウント作成が必要です",
          description: "選択したプランでアカウントを作成してください。",
        });
        navigate('/training/signup');
        return;
      }

      // ログイン済みユーザーは既存の決済フローを実行
      console.log(`スタンダードプラン ${selectedDuration}ヶ月のチェックアウト開始（ログイン済み）`);

      const returnUrl = window.location.origin + '/profile';

      // TODO: 'community'プランは存在しないため、'standard'を使用
      const { url, error } = await createCheckoutSession(
        returnUrl,
        'standard',
        selectedDuration
      );
      
      if (error) {
        throw error;
      }
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('購読エラー:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "決済処理の開始に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <TrainingLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">トレーニングプラン</h1>
          <p className="text-lg text-gray-600">
            BONOトレーニングの全コンテンツにアクセスして、実践的なスキルを身につけましょう
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          {/* プラン期間選択 */}
          <Tabs 
            value={selectedDuration.toString()} 
            onValueChange={(value) => setSelectedDuration(parseInt(value) as 1 | 3)}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1">1ヶ月</TabsTrigger>
              <TabsTrigger value="3">3ヶ月</TabsTrigger>
            </TabsList>
            
            <TabsContent value="1" className="mt-6">
              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle>コミュニティプラン</CardTitle>
                  <div className="mt-2 mb-2">
                    <span className="text-3xl font-bold">1,480円</span>
                    <span className="text-gray-500">/月</span>
                  </div>
                  <CardDescription>月額プラン</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>すべてのトレーニングコンテンツが見放題</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>実践的な課題とサンプルコード</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>プロジェクト例と解説</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    disabled={isLoading || (isSubscribed && planType === 'standard' && hasMemberAccess)}
                    onClick={handleSubscribe}
                  >
                    {isLoading ? '処理中...' :
                     (isSubscribed && planType === 'standard' && hasMemberAccess) ? '現在のプラン' :
                     user ? '選択する' : 'アカウントを作成して始める'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="3" className="mt-6">
              <Card className="relative border-amber-200">
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-amber-500 text-white px-3 py-1">600円お得</Badge>
                </div>
                <CardHeader className="text-center pt-8">
                  <CardTitle>コミュニティプラン</CardTitle>
                  <div className="mt-2 mb-2">
                    <span className="text-3xl font-bold">1,280円</span>
                    <span className="text-gray-500">/月</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    3ヶ月分: 3,840円
                  </div>
                  <CardDescription>3ヶ月プラン（600円お得）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>すべてのトレーニングコンテンツが見放題</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>実践的な課題とサンプルコード</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>プロジェクト例と解説</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    disabled={isLoading || (isSubscribed && planType === 'standard' && hasMemberAccess)}
                    onClick={handleSubscribe}
                  >
                    {isLoading ? '処理中...' :
                     (isSubscribed && planType === 'standard' && hasMemberAccess) ? '現在のプラン' :
                     user ? '選択する' : 'アカウントを作成して始める'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-12 bg-gray-50 border border-gray-100 rounded-lg p-6 max-w-md mx-auto">
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
