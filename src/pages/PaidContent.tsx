
import React from 'react';
import Layout from '@/components/layout/Layout';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaidContent: React.FC = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">メンバー限定コンテンツ</h1>
        
        <SubscriptionGuard>
          {/* サブスクリプションを持つユーザーのみが見られるコンテンツ */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>プレミアム動画</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  {/* ここに実際の動画プレーヤーを配置 */}
                  <div className="text-center p-4">
                    <h3 className="text-xl font-medium mb-2">サンプル動画</h3>
                    <p className="mb-4">この動画はメンバーシップに加入しているユーザーのみが閲覧できます。</p>
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md inline-block">
                      動画プレーヤー（サンプル）
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>その他のプレミアムコンテンツ</CardTitle>
              </CardHeader>
              <CardContent>
                <p>これはプレミアム会員のみがアクセスできる追加コンテンツです。あなたはアクティブなサブスクリプションを持っているため、このコンテンツを閲覧できます。</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>限定記事へのアクセス</li>
                  <li>オリジナルコンテンツのダウンロード</li>
                  <li>メンバー限定ディスカッション</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </SubscriptionGuard>
      </div>
    </Layout>
  );
};

export default PaidContent;
