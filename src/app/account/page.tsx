// src/app/account/page.tsx — mainのスタイルに準拠
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import SubscriptionInfo from "@/components/account/SubscriptionInfo";
import {
  SettingsPageLayout,
  SettingsPageTitle,
  SettingsCard,
  SettingsField,
} from "@/components/common/SettingsPageLayout";

export const metadata: Metadata = {
  title: "アカウント情報",
  description: "アカウント情報とサブスクリプション管理",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  const subscription = await getSubscriptionStatus();

  return (
    <SettingsPageLayout>
      <SettingsPageTitle>アカウント情報</SettingsPageTitle>

      {/* 基本情報 */}
      <SettingsCard title="基本情報">
        <div className="space-y-3">
          <SettingsField label="メールアドレス:">
            {user.email}
          </SettingsField>
        </div>
      </SettingsCard>

      {/* サブスクリプション情報 */}
      <div className="mb-6">
        <SubscriptionInfo
          planType={subscription.planType}
          duration={subscription.duration}
          isSubscribed={subscription.isSubscribed}
          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
          cancelAt={subscription.cancelAt}
          renewalDate={subscription.renewalDate}
        />
      </div>

      {/* パスワード変更 */}
      <SettingsCard title="パスワード">
        <div className="flex items-center justify-between">
          <SettingsField label="現在のパスワード:">
            <span className="text-gray-400">••••••••••••</span>
          </SettingsField>
          <Button variant="ghost" size="sm" disabled>
            変更
          </Button>
        </div>
        <p className="font-noto-sans-jp text-xs text-gray-500 mt-3">
          パスワード変更機能は現在準備中です
        </p>
      </SettingsCard>

      {/* アカウント削除 */}
      <SettingsCard
        title="危険な操作"
        className="border-destructive/50"
        titleClassName="text-destructive"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-noto-sans-jp font-medium text-base text-gray-800">
              アカウントを削除
            </p>
            <p className="font-noto-sans-jp text-sm text-gray-500 mt-1">
              この操作は取り消せません。すべてのデータが削除されます。
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled>
            削除
          </Button>
        </div>
      </SettingsCard>
    </SettingsPageLayout>
  );
}
