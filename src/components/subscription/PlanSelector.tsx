/**
 * プラン選択セクション（Client Component）
 *
 * 1ヶ月/3ヶ月の期間切り替えタブと、PlanCardグリッドを表示する。
 * mainのSubscription.tsxの期間選択ロジックをNext.js用に移植。
 */
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackViewPlans } from "@/lib/analytics";
import { PlanCard } from "@/components/subscription/PlanCard";
import type { PlanType, PlanDuration } from "@/types/subscription";

/** 各プランの期間別価格 */
interface PlanPrices {
  1: number; // 1ヶ月の合計金額
  3: number; // 3ヶ月の合計金額
}

/** ページから渡されるプラン情報 */
export interface PlanData {
  id: PlanType;
  name: string;
  description: string;
  prices: PlanPrices;
  features: string[];
  popular: boolean;
}

interface PlanSelectorProps {
  plans: PlanData[];
  isLoggedIn: boolean;
  isSubscribed: boolean;
  currentPlanType: PlanType | null;
  currentDuration: PlanDuration | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function PlanSelector({
  plans,
  isLoggedIn,
  isSubscribed,
  currentPlanType,
  currentDuration,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: PlanSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>(1);

  // プランページ表示イベント（mainと同じ: 初回表示時に1回だけ発火）
  useEffect(() => {
    const referrer = document.referrer || undefined;
    trackViewPlans(referrer);
  }, []);

  return (
    <>
      {/* 期間選択タブ */}
      <div className="flex justify-center mb-8">
        <Tabs
          value={selectedDuration.toString()}
          onValueChange={(value) =>
            setSelectedDuration(Number(value) as PlanDuration)
          }
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

      {/* プランカード一覧 */}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {plans.map((plan) => {
          // mainと同じ判定: プランタイプ AND 期間が両方一致する場合のみ「現在のプラン」
          const isCurrentPlan =
            isSubscribed &&
            currentPlanType === plan.id &&
            currentDuration === selectedDuration;

          return (
            <PlanCard
              key={plan.id}
              plan={{
                ...plan,
                price: plan.prices[selectedDuration],
              }}
              duration={selectedDuration}
              isCurrentPlan={isCurrentPlan}
              isCanceled={isCurrentPlan && cancelAtPeriodEnd}
              isLoggedIn={isLoggedIn}
              isSubscribed={isSubscribed}
              currentPlanType={currentPlanType}
              currentDuration={currentDuration}
              currentPeriodEnd={currentPeriodEnd}
            />
          );
        })}
      </div>
    </>
  );
}
