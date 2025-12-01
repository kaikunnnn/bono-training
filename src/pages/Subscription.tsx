
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession, updateSubscription } from '@/services/stripe';
import { PlanType } from '@/utils/subscriptionPlans';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlanCard from '@/components/subscription/PlanCard';
import PlanComparison from '@/components/subscription/PlanComparison';
import SubscriptionHeader from '@/components/subscription/SubscriptionHeader';
import { formatPlanDisplay } from '@/utils/planDisplay';
import { PlanChangeConfirmModal } from '@/components/subscription/PlanChangeConfirmModal';
import { getPlanPrices, PlanPrices } from '@/services/pricing';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, planType, duration: currentDuration, renewalDate } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<1 | 3>(1); // 期間選択の状態

  // プラン変更確認モーダル用の状態
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<{
    type: PlanType;
    duration: 1 | 3;
  } | null>(null);

  // 料金データの状態
  const [planPrices, setPlanPrices] = useState<PlanPrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  // Success URL処理: プラン変更完了時のトースト表示
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('updated') === 'true') {
      toast({
        title: "プランを変更しました",
        description: "サブスクリプションの変更が完了しました。",
      });
      // URLをクリーンアップ
      window.history.replaceState({}, '', '/subscription');
    }
  }, [toast]);

  // 料金を取得
  useEffect(() => {
    async function fetchPrices() {
      setPricesLoading(true);
      const { prices, source, error } = await getPlanPrices();

      if (!error && prices) {
        setPlanPrices(prices);
        console.log(`✅ 料金取得成功 (source: ${source}):`, prices);
      } else {
        console.error('❌ 料金取得失敗:', error);
        toast({
          title: "料金情報の取得に失敗しました",
          description: "ページを再読み込みしてください。",
          variant: "destructive",
        });
      }

      setPricesLoading(false);
    }

    fetchPrices();
  }, [toast]);

  // 料金プラン情報（Stripeから動的に取得）
  const plans = planPrices ? [
    {
      id: 'standard',
      name: 'スタンダード',
      description: '全てのコンテンツにアクセスできる基本プラン',
      durations: [
        {
          months: 1,
          price: planPrices.standard_1m.unit_amount,
          priceLabel: `¥${planPrices.standard_1m.unit_amount.toLocaleString()}/月`
        },
        {
          months: 3,
          price: planPrices.standard_3m.unit_amount,
          priceLabel: `¥${planPrices.standard_3m.unit_amount.toLocaleString()}/月（3ヶ月）`
        }
      ],
      features: {
        learning: true,
        member: true,
        training: true
      },
      recommended: false
    },
    {
      id: 'feedback',
      name: 'フィードバック',
      description: '全コンテンツ + フィードバック機能が利用できるプラン',
      durations: [
        {
          months: 1,
          price: planPrices.feedback_1m.unit_amount,
          priceLabel: `¥${planPrices.feedback_1m.unit_amount.toLocaleString()}/月`
        },
        {
          months: 3,
          price: planPrices.feedback_3m.unit_amount,
          priceLabel: `¥${planPrices.feedback_3m.unit_amount.toLocaleString()}/月（3ヶ月）`
        }
      ],
      features: {
        learning: true,
        member: true,
        training: true
      },
      recommended: true
    }
  ] : null;

  const handleSubscribe = async (selectedPlanType: PlanType) => {
    setIsLoading(true);
    try {
      // 既存契約者かどうかで分岐
      if (isSubscribed) {
        // 既存契約者 → 確認モーダルを表示
        console.log('既存契約者: プラン変更確認モーダルを表示します', {
          currentPlan: planType,
          currentDuration: currentDuration,
          selectedPlan: selectedPlanType,
          selectedDuration: selectedDuration
        });

        // モーダル表示
        setSelectedNewPlan({
          type: selectedPlanType,
          duration: selectedDuration,
        });
        setShowConfirmModal(true);
        setIsLoading(false);
      } else {
        // 新規ユーザー → Checkoutに遷移
        console.log('新規ユーザー: Checkoutに遷移します', {
          planType: selectedPlanType,
          duration: selectedDuration
        });

        const returnUrl = window.location.origin + '/subscription/success';
        const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);

        if (error) {
          throw error;
        }

        if (url) {
          window.location.href = url;
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('購読エラー:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "処理の開始に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  /**
   * プラン変更確認モーダルで「確定」ボタンが押されたときの処理
   * Phase 5: update-subscription APIを使用（Checkoutは使わない）
   * Phase 6-3: Realtime通知でWebhook完了を待つ
   */
  const handleConfirmPlanChange = async () => {
    if (!selectedNewPlan) return;

    setIsLoading(true);
    setShowConfirmModal(false);

    try {
      console.log('プラン変更を確定します', {
        currentPlan: planType,
        currentDuration: currentDuration,
        newPlan: selectedNewPlan.type,
        newDuration: selectedNewPlan.duration
      });

      // Phase 5: update-subscription APIでプラン変更
      const { success, error } = await updateSubscription(
        selectedNewPlan.type,
        selectedNewPlan.duration
      );

      if (error) {
        throw error;
      }

      if (success) {
        toast({
          title: "プラン変更を受け付けました",
          description: "変更を処理中です。しばらくお待ちください...",
        });

        // ========================================
        // Phase 6-3: Realtime通知でWebhook完了を待つ
        // ========================================
        // useSubscription hookがすでにRealtime subscriptionを設定済み
        // user_subscriptionsテーブルが更新されると自動的にUIが更新される
        // ここでは10秒のタイムアウト処理のみ実装

        if (!user) {
          console.error('❌ ユーザー情報が取得できません');
          throw new Error('ユーザー情報が取得できません');
        }

        let updateDetected = false;
        let timeoutId: NodeJS.Timeout;

        // プラン変更を検知するためのチャンネルを個別に設定
        const changeDetectionChannel = supabase
          .channel('plan_change_detection')
          .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_subscriptions',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('✅ プラン変更をRealtime検知:', payload);
              updateDetected = true;

              // タイムアウトをクリア
              if (timeoutId) {
                clearTimeout(timeoutId);
              }

              // 成功メッセージ
              toast({
                title: "プラン変更が完了しました",
                description: "新しいプランが適用されました。",
              });

              // ローディング終了
              setIsLoading(false);
              setSelectedNewPlan(null);

              // チャンネルをクリーンアップ
              changeDetectionChannel.unsubscribe();
            }
          )
          .subscribe();

        // 10秒のタイムアウト設定
        timeoutId = setTimeout(() => {
          if (!updateDetected) {
            console.warn('⚠️ プラン変更のタイムアウト（10秒経過）');

            toast({
              title: "処理に時間がかかっています",
              description: "プラン変更の処理が完了していない可能性があります。ページを更新してご確認ください。",
              variant: "destructive",
            });

            setIsLoading(false);
            setSelectedNewPlan(null);
            changeDetectionChannel.unsubscribe();
          }
        }, 10000); // 10秒
      }
    } catch (error) {
      console.error('プラン変更エラー:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "プラン変更に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
      setIsLoading(false);
      setSelectedNewPlan(null);
    }
  };

  /**
   * プラン変更確認モーダルで「キャンセル」ボタンが押されたときの処理
   */
  const handleCancelPlanChange = () => {
    setShowConfirmModal(false);
    setSelectedNewPlan(null);
    setIsLoading(false);
  };

  // formatPlanDisplayをimportして使用するため、getCurrentPlanName関数は不要

  // ローディング中の表示
  if (pricesLoading || !plans) {
    return (
      <Layout>
        <div className="container py-8 max-w-5xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">料金プランを読み込み中...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <SubscriptionHeader
          isSubscribed={isSubscribed}
          currentPlanName={formatPlanDisplay(planType, currentDuration)}
        />

        {/* 期間選択タブ（ページ全体） */}
        <div className="flex justify-center mb-8">
          <Tabs
            value={selectedDuration.toString()}
            onValueChange={(value) => setSelectedDuration(Number(value) as 1 | 3)}
            className="w-auto"
          >
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="1" className="font-noto-sans-jp">
                1ヶ月
              </TabsTrigger>
              <TabsTrigger value="3" className="font-noto-sans-jp">
                3ヶ月
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            // 現在のプランと完全に一致する場合のみ「現在のプラン」と判定
            // プランタイプと期間の両方が一致する必要がある
            const isCurrentPlan = isSubscribed &&
                                  planType === plan.id &&
                                  currentDuration === selectedDuration;
            const selectedPriceInfo = plan.durations.find(d => d.months === selectedDuration) || plan.durations[0];

            return (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                price={selectedPriceInfo.price}
                priceLabel={selectedPriceInfo.priceLabel}
                duration={selectedDuration}
                features={plan.features}
                recommended={plan.recommended}
                isCurrentPlan={isCurrentPlan}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
                isSubscribed={isSubscribed}
              />
            );
          })}
        </div>

        <PlanComparison />
      </div>

      {/* プラン変更確認モーダル */}
      {showConfirmModal && selectedNewPlan && planType && currentDuration && renewalDate && (
        <PlanChangeConfirmModal
          currentPlan={{
            type: planType,
            duration: currentDuration as 1 | 3,
          }}
          newPlan={selectedNewPlan}
          currentPeriodEnd={new Date(renewalDate)}
          onConfirm={handleConfirmPlanChange}
          onCancel={handleCancelPlanChange}
        />
      )}
    </Layout>
  );
};

export default SubscriptionPage;
