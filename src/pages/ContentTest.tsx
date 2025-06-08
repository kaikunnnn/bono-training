
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ContentGuard from '@/components/subscription/ContentGuard';
import { PlanType, UserPlanInfo } from '@/utils/subscriptionPlans';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

const ContentTest: React.FC = () => {
  // ユーザープラン情報の状態管理（実際はサーバーから取得する）
  const [userPlan, setUserPlan] = useState<UserPlanInfo>({
    planType: null,
    isActive: false,
    expiresAt: null
  });

  // プラン変更ハンドラー
  const handlePlanChange = (planType: PlanType | null) => {
    setUserPlan({
      ...userPlan,
      planType
    });
  };

  // アクティブ状態切り替えハンドラー
  const toggleActive = () => {
    setUserPlan({
      ...userPlan,
      isActive: !userPlan.isActive
    });
  };

  // テスト用にSubscriptionContextの値をオーバーライドする
  const mockSubscriptionValue = {
    isSubscribed: userPlan.isActive,
    planType: userPlan.planType,
    loading: false,
    error: null,
    refresh: async () => {
      console.log('Mock refresh called');
      // 実際の更新処理は行わない（モックのため）
    },
    // 新しいアクセス権限フラグを追加
    hasMemberAccess: userPlan.isActive && (userPlan.planType === 'standard' || userPlan.planType === 'growth' || userPlan.planType === 'community'),
    hasLearningAccess: userPlan.isActive && (userPlan.planType === 'standard' || userPlan.planType === 'growth')
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">コンテンツアクセステスト</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* 左カラム: プラン設定パネル */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>プラン設定（テスト用）</CardTitle>
                <CardDescription>表示をテストしたいプランを選択してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">プランタイプ</h3>
                  <RadioGroup
                    value={userPlan.planType || ''}
                    onValueChange={(value) => handlePlanChange(value as PlanType || null)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="none" />
                      <Label htmlFor="none">プランなし</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">スタンダード</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="growth" id="growth" />
                      <Label htmlFor="growth">グロース</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="community" id="community" />
                      <Label htmlFor="community">コミュニティ</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">サブスクリプション状態</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={userPlan.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={toggleActive}
                    >
                      {userPlan.isActive ? '有効' : '無効'}
                    </Button>
                    <Label>現在のステータス: {userPlan.isActive ? '有効' : '無効'}</Label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">現在の設定</h3>
                  <pre className="bg-muted p-2 rounded text-xs">
                    {JSON.stringify({
                      ...userPlan,
                      // 新しいアクセス権限フラグも表示に追加
                      hasMemberAccess: mockSubscriptionValue.hasMemberAccess,
                      hasLearningAccess: mockSubscriptionValue.hasLearningAccess
                    }, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 右カラム: コンテンツ表示エリア */}
          <div className="md:col-span-2">
            {/* テスト用にSubscriptionProviderで値をオーバーライド */}
            <SubscriptionProvider overrideValue={mockSubscriptionValue}>
              <Tabs defaultValue="learning">
                <TabsList className="mb-4">
                  <TabsTrigger value="learning">学習コンテンツ</TabsTrigger>
                  <TabsTrigger value="member">メンバー限定コンテンツ</TabsTrigger>
                </TabsList>
                
                {/* 学習コンテンツタブ */}
                <TabsContent value="learning">
                  <Card>
                    <CardHeader>
                      <CardTitle>学習コンテンツ（Learning）</CardTitle>
                      <CardDescription>
                        このコンテンツを閲覧するには Standard または Growth プランが必要です
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ContentGuard contentType="learning">
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <h3 className="text-lg font-medium text-green-800 mb-2">アクセス成功！</h3>
                            <p className="text-green-700">
                              あなたは「学習コンテンツ」へのアクセス権を持っています。
                              このコンテンツはStandardまたはGrowthプランユーザーのみが閲覧できます。
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h3 className="font-medium">学習コンテンツの例</h3>
                            <p>ここに学習コンテンツが表示されます。例えば、チュートリアル、ガイド、レッスンなど。</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>基本的なプログラミングの概念</li>
                              <li>アプリケーション開発のベストプラクティス</li>
                              <li>コード最適化テクニック</li>
                            </ul>
                          </div>
                        </div>
                      </ContentGuard>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* メンバー限定コンテンツタブ */}
                <TabsContent value="member">
                  <Card>
                    <CardHeader>
                      <CardTitle>メンバー限定コンテンツ（Member）</CardTitle>
                      <CardDescription>
                        このコンテンツを閲覧するには Standard, Growth または Community プランが必要です
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ContentGuard contentType="member">
                        <div className="space-y-4">
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                            <h3 className="text-lg font-medium text-purple-800 mb-2">アクセス成功！</h3>
                            <p className="text-purple-700">
                              あなたは「メンバー限定コンテンツ」へのアクセス権を持っています。
                              このコンテンツはStandard, Growth または Communityプランユーザーのみが閲覧できます。
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h3 className="font-medium">メンバー限定コンテンツの例</h3>
                            <p>ここにメンバー限定コンテンツが表示されます。例えば、プレミアムチュートリアル、特別なリソース、コミュニティツールなど。</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>プレミアムビデオコンテンツ</li>
                              <li>会員限定ディスカッション</li>
                              <li>高度なプロジェクトテンプレート</li>
                            </ul>
                          </div>
                        </div>
                      </ContentGuard>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </SubscriptionProvider>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContentTest;
