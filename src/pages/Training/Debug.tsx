
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TrainingDebug = () => {
  const [searchParams] = useSearchParams();
  const currentPlan = searchParams.get('plan') || 'actual';
  
  const {
    isSubscribed,
    planType,
    loading,
    hasMemberAccess,
    hasLearningAccess,
    error
  } = useSubscriptionContext();

  const testPlans = ['free', 'standard', 'growth', 'community'];

  const getExpectedAccess = (plan: string) => {
    switch (plan) {
      case 'free':
        return { member: false, learning: false };
      case 'standard':
        return { member: true, learning: true };
      case 'growth':
        return { member: true, learning: true };
      case 'community':
        return { member: true, learning: false };
      default:
        return { member: false, learning: false };
    }
  };

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phase 3 - プラン判定テスト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 現在の状態表示 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Loading</div>
                  <Badge variant={loading ? "destructive" : "default"}>
                    {loading ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Subscribed</div>
                  <Badge variant={isSubscribed ? "default" : "secondary"}>
                    {isSubscribed ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Plan Type</div>
                  <Badge variant="outline">
                    {planType || "null"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Current Test</div>
                  <Badge variant="outline">
                    {currentPlan}
                  </Badge>
                </div>
              </div>

              {/* アクセス権限表示 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Member Access</div>
                  <Badge variant={hasMemberAccess ? "default" : "destructive"}>
                    {hasMemberAccess ? "✓ Granted" : "✗ Denied"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Learning Access</div>
                  <Badge variant={hasLearningAccess ? "default" : "destructive"}>
                    {hasLearningAccess ? "✓ Granted" : "✗ Denied"}
                  </Badge>
                </div>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800">Error: {error.message}</div>
                </div>
              )}

              {/* 期待値チェック */}
              {currentPlan !== 'actual' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-800 font-medium mb-2">期待値チェック (plan={currentPlan})</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      Member Access: 
                      <span className={`ml-2 ${getExpectedAccess(currentPlan).member === hasMemberAccess ? 'text-green-600' : 'text-red-600'}`}>
                        Expected: {getExpectedAccess(currentPlan).member ? 'true' : 'false'}, 
                        Actual: {hasMemberAccess ? 'true' : 'false'}
                        {getExpectedAccess(currentPlan).member === hasMemberAccess ? ' ✓' : ' ✗'}
                      </span>
                    </div>
                    <div>
                      Learning Access: 
                      <span className={`ml-2 ${getExpectedAccess(currentPlan).learning === hasLearningAccess ? 'text-green-600' : 'text-red-600'}`}>
                        Expected: {getExpectedAccess(currentPlan).learning ? 'true' : 'false'}, 
                        Actual: {hasLearningAccess ? 'true' : 'false'}
                        {getExpectedAccess(currentPlan).learning === hasLearningAccess ? ' ✓' : ' ✗'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* テストプラン切り替えボタン */}
          <Card>
            <CardHeader>
              <CardTitle>プランテスト</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button
                  asChild
                  variant={currentPlan === 'actual' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Link to="/training/debug">Actual</Link>
                </Button>
                {testPlans.map((plan) => (
                  <Button
                    key={plan}
                    asChild
                    variant={currentPlan === plan ? 'default' : 'outline'}
                    size="sm"
                  >
                    <Link to={`/training/debug?plan=${plan}`}>{plan}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/training">← Back to Training Home</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/training/todo-app">Test Training Detail</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/training/todo-app/introduction">Test Task Page</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingDebug;
