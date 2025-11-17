import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { refresh, planType } = useSubscriptionContext();
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

  const getPlanName = (type: string | null) => {
    if (!type) return 'プラン';

    const planMap: Record<string, string> = {
      standard: 'スタンダード',
      feedback: 'フィードバック'
    };

    return planMap[type] || type;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-16 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground font-noto-sans-jp">
                  決済情報を確認しています...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-16 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-noto-sans-jp">エラーが発生しました</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <p className="text-center text-muted-foreground font-noto-sans-jp">
                  {error}
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => navigate('/subscription')} variant="outline" className="font-noto-sans-jp">
                    プラン一覧に戻る
                  </Button>
                  <Button onClick={() => navigate('/account')} className="font-noto-sans-jp">
                    アカウント設定
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl font-noto-sans-jp">
              決済が完了しました
            </CardTitle>
            <CardDescription className="text-center font-noto-sans-jp">
              {planType && `${getPlanName(planType)}プランへようこそ！`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground font-noto-sans-jp">
                  サブスクリプションが有効になりました。すべてのプレミアムコンテンツにアクセスできます。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/lessons')}
                  size="lg"
                  className="font-noto-sans-jp"
                >
                  レッスンを見る
                </Button>
                <Button
                  onClick={() => navigate('/account')}
                  variant="outline"
                  size="lg"
                  className="font-noto-sans-jp"
                >
                  アカウント設定
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => navigate('/subscription')}
                  variant="link"
                  className="font-noto-sans-jp"
                >
                  プラン一覧に戻る
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SubscriptionSuccess;
