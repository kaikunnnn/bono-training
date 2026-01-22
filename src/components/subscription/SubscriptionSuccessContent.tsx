/**
 * サブスクリプション成功ページの共通コンポーネント
 * 新規登録成功とプラン更新成功で共通利用
 *
 * オンボーディング情報を含む：
 * - 学習コンテンツへの導線
 * - 旧サイト（bo-no.design）へのアクセス案内（新規登録時のみ）
 * - アカウント管理への導線
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, BookOpen, Globe, Settings, ExternalLink } from '@/lib/icons';
import { getPlanDisplayName, type PlanType } from '@/utils/subscriptionPlans';

export type SuccessType = 'new' | 'updated';

// 旧サイト（Memberstack）のログインURL
const LEGACY_SITE_LOGIN_URL = 'https://bo-no.design/login';

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
 * オンボーディングセクションカード
 */
interface OnboardingSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const OnboardingSection: React.FC<OnboardingSectionProps> = ({ icon, title, children }) => (
  <div className="bg-muted/50 border rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold font-noto-sans-jp">{title}</h3>
    </div>
    {children}
  </div>
);

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
    return durationText ? `${planName}プラン（${durationText}）` : `${planName}プラン`;
  };

  // タイプに応じたテキスト
  const texts = {
    new: {
      title: '登録が完了しました',
      subtitle: planType ? `${getFullPlanName(planType, duration)}へようこそ！` : '',
      description: 'ご登録ありがとうございます！以下のコンテンツにアクセスできるようになりました。',
      loadingText: '決済情報を確認しています...',
    },
    updated: {
      title: 'プラン変更が完了しました',
      subtitle: planType ? `${getFullPlanName(planType, duration)}への変更が完了しました` : '',
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
    <div className="container py-8 sm:py-16 max-w-2xl">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl font-noto-sans-jp">
            {currentTexts.title}
          </CardTitle>
          <CardDescription className="text-center font-noto-sans-jp text-base">
            {currentTexts.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 説明文 */}
            <p className="text-center text-muted-foreground font-noto-sans-jp">
              {currentTexts.description}
            </p>

            {/* オンボーディングセクション */}
            <div className="space-y-4">
              {/* 学習コンテンツセクション */}
              <OnboardingSection
                icon={<BookOpen className="h-5 w-5 text-primary" />}
                title="学習コンテンツ"
              >
                <p className="text-sm text-muted-foreground mb-3 font-noto-sans-jp">
                  体系的に学べるレッスンと、実践的なトレーニングをご用意しています。
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => navigate('/lessons')}
                    className="flex-1 font-noto-sans-jp"
                  >
                    レッスン一覧を見る
                  </Button>
                  <Button
                    onClick={() => navigate('/training')}
                    variant="outline"
                    className="flex-1 font-noto-sans-jp"
                  >
                    トレーニングを見る
                  </Button>
                </div>
              </OnboardingSection>

              {/* 旧サイト案内セクション（新規登録時のみ表示） */}
              {type === 'new' && (
                <OnboardingSection
                  icon={<Globe className="h-5 w-5 text-blue-500" />}
                  title="旧サイト（bo-no.design）もご利用いただけます"
                >
                  <p className="text-sm text-muted-foreground mb-3 font-noto-sans-jp">
                    同じメールアドレスでアクセスできます。
                    初回ログイン時は「パスワードを忘れた方」からパスワードリセットをお願いします。
                  </p>
                  <Button
                    variant="outline"
                    className="w-full font-noto-sans-jp"
                    onClick={() => window.open(LEGACY_SITE_LOGIN_URL, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    旧サイトにログイン
                  </Button>
                </OnboardingSection>
              )}

              {/* アカウント管理セクション */}
              <OnboardingSection
                icon={<Settings className="h-5 w-5 text-gray-500" />}
                title="アカウント管理"
              >
                <p className="text-sm text-muted-foreground mb-3 font-noto-sans-jp">
                  サブスクリプションの確認・変更、請求情報の確認ができます。
                </p>
                <Button
                  onClick={() => navigate('/account')}
                  variant="outline"
                  className="w-full font-noto-sans-jp"
                >
                  アカウント設定を開く
                </Button>
              </OnboardingSection>
            </div>

            {/* プラン一覧リンク */}
            <div className="text-center pt-2">
              <Button
                onClick={() => navigate('/subscription')}
                variant="link"
                className="font-noto-sans-jp text-muted-foreground"
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
