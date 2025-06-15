
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession } from '@/services/stripe';

const TrainingPlan: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubscribed, planType, hasMemberAccess, loading } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // Communityプランでメンバーアクセスがある場合は既に課金済み
  const isCurrentlySubscribed = isSubscribed && hasMemberAccess;
  
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      console.log('Community プランのチェックアウト開始');
      
      // チェックアウト後に戻るURLを指定
      const returnUrl = window.location.origin + '/training/plan?success=true';
      
      const { url, error } = await createCheckoutSession(
        returnUrl,
        'community' // Community専用
      );
      
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
  
  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">読み込み中...</div>
        </div>
      </TrainingLayout>
    );
  }
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">🏃‍♂️ BONO Training</h1>
          <p className="text-lg text-gray-600 mb-2">
            実践的なデザインスキルを身につける筋トレ型トレーニング
          </p>
          <p className="text-sm text-gray-500">
            デザインの基礎から実践まで、ステップバイステップで学習
          </p>
        </div>
        
        {/* 成功メッセージ */}
        {new URLSearchParams(window.location.search).get('success') === 'true' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-medium mb-2">🎉 ありがとうございます！</h3>
            <p className="text-green-700 text-sm">
              メンバーシップへの登録が完了しました。すべてのトレーニングコンテンツにアクセスできます。
            </p>
          </div>
        )}
        
        {/* Communityプランカード */}
        <div className="max-w-md mx-auto">
          <Card className={`relative ${isCurrentlySubscribed ? 'border-green-500 bg-green-50' : 'border-2 border-primary shadow-lg'}`}>
            {/* おすすめバッジ */}
            {!isCurrentlySubscribed && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-white px-4 py-1 text-sm font-medium">
                  <Star className="w-3 h-3 mr-1" />
                  おすすめプラン
                </Badge>
              </div>
            )}
            
            {/* 現在のプランバッジ */}
            {isCurrentlySubscribed && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-green-500 text-white px-4 py-1 text-sm font-medium">
                  <Check className="w-3 h-3 mr-1" />
                  現在のプラン
                </Badge>
              </div>
            )}
            
            <CardHeader className="pt-8 text-center">
              <CardTitle className="text-2xl font-bold">コミュニティプラン</CardTitle>
              <CardDescription className="text-lg">
                トレーニングの全コンテンツにアクセス可能
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">¥1,480</span>
                <span className="text-gray-600 ml-1">/月</span>
              </div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>すべてのトレーニングコンテンツへのアクセス</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>実践的なデザインプロジェクト</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>プレミアム学習教材の閲覧</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>コミュニティへの参加権限</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>いつでも解約可能</span>
                </div>
              </div>
              
              <Button 
                className="w-full text-lg py-6"
                disabled={isLoading || isCurrentlySubscribed}
                onClick={handleSubscribe}
                variant={isCurrentlySubscribed ? "outline" : "default"}
              >
                {isLoading ? (
                  '処理中...'
                ) : isCurrentlySubscribed ? (
                  '登録済み'
                ) : (
                  'メンバーシップに登録する'
                )}
              </Button>
              
              {!isCurrentlySubscribed && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  * Stripeの安全な決済システムを利用します
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* 補足情報 */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 text-center">メンバーシップについて</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">💳 決済について</h4>
                <ul className="space-y-1">
                  <li>• 月額1,480円（税込）</li>
                  <li>• クレジットカード決済</li>
                  <li>• 初回課金後即座にアクセス可能</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">🔄 解約について</h4>
                <ul className="space-y-1">
                  <li>• いつでも解約可能</li>
                  <li>• 解約後も期間終了まで利用可能</li>
                  <li>• 解約手数料なし</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* ナビゲーション */}
        <div className="text-center mt-8 space-x-4">
          <Button variant="outline" onClick={() => navigate('/training')}>
            トレーニング一覧を見る
          </Button>
          {isCurrentlySubscribed && (
            <Button variant="outline" onClick={() => navigate('/profile')}>
              プロフィールページ
            </Button>
          )}
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingPlan;
