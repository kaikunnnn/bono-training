import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import Layout from '@/components/layout/Layout';
import SubscriptionInfo from '@/components/account/SubscriptionInfo';

/**
 * Account ページ
 * ユーザーのアカウント情報とサブスクリプション情報を表示
 */
export default function Account() {
  const { user } = useAuth();
  const {
    planType,
    duration,
    isSubscribed,
    cancelAtPeriodEnd,
    cancelAt,
    renewalDate,
    loading
  } = useSubscriptionContext();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-4 font-noto-sans-jp text-gray-600">読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-noto-sans-jp font-bold text-3xl text-gray-800 mb-8">
            アカウント情報
          </h1>

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-4">
              基本情報
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-noto-sans-jp text-sm text-gray-600">メールアドレス:</span>
                <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
                  {email}
                </span>
              </div>
            </div>
          </div>

          {/* サブスクリプション情報 */}
          <SubscriptionInfo
            planType={planType}
            duration={duration}
            isSubscribed={isSubscribed}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            cancelAt={cancelAt}
            renewalDate={renewalDate}
          />
        </div>
      </div>
    </Layout>
  );
}
