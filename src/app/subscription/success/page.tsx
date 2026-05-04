"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SubscriptionSuccessContent } from "@/components/subscription/SubscriptionSuccessContent";
import {
  trackSubscriptionStart,
  trackPurchase,
} from "@/lib/analytics";
import type { PlanType } from "@/types/subscription";
import type { SuccessType } from "@/components/subscription/SubscriptionSuccessContent";

type PlanDuration = 1 | 3;

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [duration, setDuration] = useState<PlanDuration | null>(null);

  // URLパラメータからタイプを判定（プラン変更の場合: ?type=updated&plan=xxx&duration=x）
  const successType: SuccessType =
    searchParams.get("type") === "updated" ? "updated" : "new";
  const urlPlanType = searchParams.get("plan") as PlanType | null;
  const urlDuration = searchParams.get("duration");

  useEffect(() => {
    // チェックアウト完了後、Webhookが処理されるまで少し待機
    const refreshSubscription = async () => {
      // URLパラメータからプラン情報を先行設定（GA4イベントの最低限の情報確保）
      // DB取得に失敗してもGA4イベントが発火できるようにする
      if (urlPlanType) {
        setPlanType(urlPlanType);
        setDuration(urlDuration ? (parseInt(urlDuration, 10) as PlanDuration) : null);
      }

      try {
        // 2秒待機してWebhookの処理を待つ
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // クライアントサイドでサブスクリプション情報を取得
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // 環境に応じたフィルタ（test/live混在を防止）
        const environment =
          process.env.NODE_ENV === "production" ? "live" : "test";

        const { data: subscription, error: subError } = await supabase
          .from("user_subscriptions")
          .select("plan_type, duration, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .eq("environment", environment)
          .maybeSingle();

        if (subError) {
          console.error("サブスクリプション情報の取得エラー:", subError);
          setIsLoading(false);
          return;
        }

        // DB取得成功時は正確なデータで上書き
        if (subscription) {
          setPlanType(subscription.plan_type as PlanType);
          setDuration(subscription.duration as PlanDuration);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("サブスクリプション情報の更新エラー:", err);
        setIsLoading(false);
      }
    };

    refreshSubscription();
  }, []);

  // GAイベント送信（サブスクリプション情報が取得できたら）
  // sessionStorageで重複送信を防止（リロード対策）
  useEffect(() => {
    if (!isLoading && planType && duration) {
      const eventKey =
        successType === "updated"
          ? `ga_plan_change_sent_${planType}_${duration}`
          : `ga_purchase_sent_${planType}_${duration}`;

      if (sessionStorage.getItem(eventKey)) {
        return; // 既に送信済み
      }

      if (successType === "updated") {
        // プラン変更イベント — PlanChangeConfirmModalで既に送信済みのため、
        // successページでは重複送信しない（fromDurationが取得できず不正確なため）
      } else {
        // 新規登録イベント
        const planPriceMap: Record<string, number> = {
          "standard-1": 6800,
          "standard-3": 17400,
          "feedback-1": 15800,
          "feedback-3": 41400,
        };

        const planKey = `${planType}-${duration}`;
        const totalPrice = planPriceMap[planKey] || 0;
        const transactionId = `sub_${planType}_${duration}_${Date.now()}`;

        trackSubscriptionStart(planType, totalPrice);
        trackPurchase({
          planType: planType,
          price: totalPrice,
          duration: duration,
          transactionId: transactionId,
        });

        sessionStorage.setItem(eventKey, transactionId);
        return;
      }

      sessionStorage.setItem(eventKey, `change_${Date.now()}`);
    }
  }, [isLoading, planType, duration, successType, urlPlanType]);

  return (
    <SubscriptionSuccessContent
      type={successType}
      planType={planType}
      duration={duration}
      isLoading={isLoading}
      error={error}
    />
  );
}
