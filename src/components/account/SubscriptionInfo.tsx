import { useState } from 'react';
import { PlanType } from '@/utils/subscriptionPlans';
import { getCustomerPortalUrl } from '@/services/stripe';

interface SubscriptionInfoProps {
  planType: PlanType | null;
  isSubscribed: boolean;
}

/**
 * SubscriptionInfo コンポーネント
 * サブスクリプション情報を表示し、Stripeカスタマーポータルへのリンクを提供
 */
export default function SubscriptionInfo({ planType, isSubscribed }: SubscriptionInfoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プラン名のマッピング
  const planNames: Record<PlanType, string> = {
    standard: 'スタンダード',
    feedback: 'フィードバック',
    community: 'フィードバック', // communityはfeedbackとして表示
    growth: 'グロース',
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = await getCustomerPortalUrl();
      window.location.href = url;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError('カスタマーポータルを開けませんでした。しばらく経ってから再度お試しください。');
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
          <span className="font-noto-sans-jp text-sm text-gray-600">現在のプラン:</span>
          <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
            {planType && isSubscribed ? planNames[planType] || planType : '無料'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-noto-sans-jp text-sm text-red-600">{error}</p>
        </div>
      )}

      {planType && isSubscribed && (
        <div>
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="inline-flex items-center bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="font-noto-sans-jp text-sm">読み込み中...</span>
              </>
            ) : (
              <span className="font-noto-sans-jp text-sm">プランを管理</span>
            )}
          </button>
          <p className="font-noto-sans-jp text-xs text-gray-500 mt-3">
            プランの変更、お支払い方法の更新、キャンセルはStripeのカスタマーポータルで行えます
          </p>
        </div>
      )}

      {(!planType || !isSubscribed) && (
        <div className="border-t border-gray-200 pt-4">
          <p className="font-noto-sans-jp text-sm text-gray-600 mb-4">
            プレミアムプランにアップグレードして、全てのコンテンツにアクセスしましょう
          </p>
          <a
            href="/subscription"
            className="inline-flex items-center bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <span className="font-noto-sans-jp text-sm">プランを見る</span>
          </a>
        </div>
      )}
    </div>
  );
}
