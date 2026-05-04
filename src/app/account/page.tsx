// src/app/account/page.tsx — mainのスタイルに準拠
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import SubscriptionInfo from "@/components/account/SubscriptionInfo";
import { PasswordChangeForm } from "@/components/account/PasswordChangeForm";
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
      <PasswordChangeForm />
    </SettingsPageLayout>
  );
}
