// src/components/account/SubscriptionInfo.tsx — mainのデザインを忠実に再現
"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerPortalUrl } from "@/lib/services/stripe";
import { getPlanDisplayName } from "@/lib/subscription-utils";
import type { PlanType } from "@/types/subscription";

interface SubscriptionInfoProps {
  planType: PlanType | null;
  duration: number | null;
  isSubscribed: boolean;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  renewalDate: string | null;
}

function formatPlanDisplay(
  planType: PlanType | null,
  duration: number | null
): string {
  if (!planType) return "フリープラン";
  const name = getPlanDisplayName(planType);
  if (duration) return `${name}（${duration}ヶ月）`;
  return name;
}

function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SubscriptionInfo({
  planType,
  duration,
  isSubscribed,
  cancelAtPeriodEnd,
  cancelAt,
  renewalDate,
}: SubscriptionInfoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = await getCustomerPortalUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Error opening customer portal:", err);
      setError(
        "カスタマーポータルを開けませんでした。しばらく経ってから再度お試しください。"
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-4">
        サブスクリプション情報
      </h2>

      <div className="space-y-3 mb-6">
        <div>
          <span className="font-noto-sans-jp text-sm text-gray-600">
            現在のプラン:
          </span>
          <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
            {isSubscribed ? formatPlanDisplay(planType, duration) : "無料"}
          </span>
          {cancelAtPeriodEnd && (
            <span className="ml-2 font-noto-sans-jp text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
              【キャンセル済み】
            </span>
          )}
        </div>

        {isSubscribed && renewalDate && (
          <div>
            <span className="font-noto-sans-jp text-sm text-gray-600">
              {cancelAtPeriodEnd ? "利用期限:" : "次回更新日:"}
            </span>
            <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
              {formatDate(renewalDate)}
            </span>
          </div>
        )}
      </div>

      {cancelAtPeriodEnd && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-noto-sans-jp text-sm text-yellow-800 mb-2">
            ⚠️ サブスクリプションがキャンセルされています
          </p>
          <Link
            href="/subscription"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-noto-sans-jp text-sm font-medium"
          >
            プランを再開する →
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-noto-sans-jp text-sm text-red-600">{error}</p>
        </div>
      )}

      {planType && isSubscribed && (
        <div>
          <Button
            onClick={handleManageSubscription}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto rounded-lg shadow-md hover:shadow-lg font-noto-sans-jp text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                読み込み中...
              </>
            ) : (
              "サブスクリプションを管理"
            )}
          </Button>
          <p className="font-noto-sans-jp text-xs text-gray-500 mt-3">
            プランの変更、お支払い方法の更新、解約はStripeのカスタマーポータルで行えます
          </p>
        </div>
      )}

      {(!planType || !isSubscribed) && (
        <div className="border-t border-gray-200 pt-4">
          <p className="font-noto-sans-jp text-sm text-gray-600 mb-4">
            プレミアムプランにアップグレードして、全てのコンテンツにアクセスしましょう
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto rounded-lg shadow-md hover:shadow-lg font-noto-sans-jp text-sm"
          >
            <Link href="/subscription">プランを見る</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
