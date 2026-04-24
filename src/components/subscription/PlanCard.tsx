// src/components/subscription/PlanCard.tsx — mainのスタイル＋Next.js機能
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/services/stripe";
import type { PlanType, PlanDuration } from "@/types/subscription";

interface PlanCardProps {
  plan: {
    id: PlanType;
    name: string;
    description: string;
    price: number;
    features: string[];
    popular: boolean;
  };
  duration: PlanDuration;
  isCurrentPlan: boolean;
  isCanceled?: boolean;
  isLoggedIn: boolean;
  isSubscribed?: boolean;
}

export function PlanCard({
  plan,
  duration,
  isCurrentPlan,
  isCanceled = false,
  isLoggedIn,
  isSubscribed = false,
}: PlanCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirectTo=/subscription`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const returnUrl = `${window.location.origin}/subscription?success=true`;
      const { url, error: checkoutError } = await createCheckoutSession(
        returnUrl,
        plan.id,
        duration
      );

      if (checkoutError) {
        setError(checkoutError.message);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError("決済処理の開始に失敗しました。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "処理中...";
    if (isCurrentPlan) return "現在のプラン";
    if (isSubscribed) return "プラン変更";
    if (!isLoggedIn) return "ログインして始める";
    return "選択する";
  };

  // 月額表示（3ヶ月の場合は÷3）
  const monthlyPrice =
    duration === 3 ? Math.floor(plan.price / 3) : plan.price;

  return (
    <Card
      className={`flex flex-col ${
        plan.popular ? "border-primary shadow-lg relative" : ""
      } ${
        isCurrentPlan
          ? isCanceled
            ? "border-orange-500"
            : "border-green-500"
          : ""
      }`}
    >
      {plan.popular && !isCurrentPlan && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge className="bg-primary text-white px-3 py-1">おすすめ</Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          {isCanceled ? (
            <Badge className="bg-orange-500 text-white px-3 py-1">
              現在のプラン【キャンセル済み】
            </Badge>
          ) : (
            <Badge className="bg-green-500 text-white px-3 py-1">
              現在のプラン
            </Badge>
          )}
        </div>
      )}

      <CardHeader className={plan.popular ? "pt-8" : ""}>
        <CardTitle className="font-noto-sans-jp">{plan.name}</CardTitle>
        <CardDescription className="mt-2 font-noto-sans-jp">
          {plan.description}
        </CardDescription>

        {/* 価格表示 — main準拠 */}
        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">
              {monthlyPrice.toLocaleString()}
            </span>
            <span className="text-lg text-gray-600">円/月</span>
          </div>
          {duration === 3 && (
            <div className="text-sm text-gray-500 mt-2 font-noto-sans-jp">
              3ヶ月一括 {plan.price.toLocaleString()}円
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="space-y-2">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-4 p-2 bg-red-50 rounded">
              {error}
            </p>
          )}

          <div className="mt-6">
            <Button
              className={`w-full ${plan.popular ? "bg-primary" : ""}`}
              disabled={isLoading || isCurrentPlan}
              onClick={handleSelectPlan}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {getButtonText()}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PlanCard;
