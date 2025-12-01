/**
 * サブスクリプション成功ページの共通コンポーネント
 * 新規登録成功とプラン更新成功で共通利用
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { getPlanDisplayName, type PlanType } from '@/utils/subscriptionPlans';

export type SuccessType = 'new' | 'updated';

interface SubscriptionSuccessContentProps {
  /** 成功タイプ: 新規登録 or プラン更新 */
  type: SuccessType;
  /** プランタイプ */
  planType: PlanType | null;
  /** 期間（1ヶ月 or 3ヶ月） */
  duration?: 1 | 3 | null;
  /** ローディング中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
}

/**
 * サブスクリプション成功ページの共通コンテンツ
 */
export const SubscriptionSuccessContent: React.FC<SubscriptionSuccessContentProps> = ({
  type,
  planType,
  duration,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();

  const getPlanName = (plan: PlanType | null) => {
    if (!plan) return 'プラン';
    return getPlanDisplayName(plan);
  };

  const getDurationText = (d: 1 | 3 | null | undefined) => {
    if (!d) return '';
    return d === 1 ? '1ヶ月' : '3ヶ月';
  };

  const getFullPlanName = (plan: PlanType | null, d: 1 | 3 | null | undefined) => {
    const planName = getPlanName(plan);
    const durationText = getDurationText(d);
    return durationText ? `${planName} ${durationText}` : planName;
  };

  // タイプに応じたテキスト
  const texts = {
    new: {
      title: '決済が完了しました',
      subtitle: planType ? `${getFullPlanName(planType, duration)}プランへようこそ！` : '',
      description: 'サブスクリプションが有効になりました。すべてのプレミアムコンテンツにアクセスできます。',
      loadingText: '決済情報を確認しています...',
    },
    updated: {
      title: 'プラン変更が完了しました',
      subtitle: planType ? `${getFullPlanName(planType, duration)}プランへの変更が完了しました` : '',
      description: '新しいプランが適用されました。引き続きサービスをお楽しみください。',
      loadingText: 'プラン変更を確認しています...',
    },
  };

  const currentTexts = texts[type];

  // ローディング表示
  if (isLoading) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground font-noto-sans-jp">
                {currentTexts.loadingText}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
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
    );
  }

  // 成功表示
  return (
    <div className="container py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl font-noto-sans-jp">
            {currentTexts.title}
          </CardTitle>
          <CardDescription className="text-center font-noto-sans-jp">
            {currentTexts.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground font-noto-sans-jp">
                {currentTexts.description}
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
  );
};
