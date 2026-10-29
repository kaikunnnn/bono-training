// src/app/account/page.tsx — mainのスタイルに準拠
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRound, Bell } from "lucide-react";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import SubscriptionInfo from "@/components/account/SubscriptionInfo";
import { PasswordChangeForm } from "@/components/account/PasswordChangeForm";
import { LogoutButton } from "@/components/account/LogoutButton";
import { SlackLinkSettingsCard } from "@/components/account/SlackLinkSettingsCard";
import { loadSlackLinkState } from "@/lib/slack-member-sync/slack-link-state";
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
    redirect("/login?reauth=1&redirectTo=/account");
  }

  // Slack の判定は off / dry_run なら設定の1回で終わる。課金状況の取得と並べて待つ
  const [subscription, slackState] = await Promise.all([
    getSubscriptionStatus(),
    loadSlackLinkState(user.id),
  ]);

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

      {/* プロフィール編集への導線（マイページと同じ /profile へ） */}
      <SettingsCard title="プロフィール">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            掲示板やコメントで表示される名前・アイコンを編集できます。
          </p>
          <Button asChild variant="outline">
            <Link href="/profile">
              <UserRound className="h-4 w-4" />
              プロフィールを編集
            </Link>
          </Button>
        </div>
      </SettingsCard>

      {/* 通知設定への導線 */}
      <SettingsCard title="通知">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            コメントやリアクションの通知を、種類ごとにオン/オフできます。
          </p>
          <Button asChild variant="outline">
            <Link href="/account/notifications">
              <Bell className="h-4 w-4" />
              通知設定を変更
            </Link>
          </Button>
        </div>
      </SettingsCard>

      {/* Slack とのつながり（#263）。課金中で未接続ならつなぐ導線、つながっていればその旨。ほかは出さない */}
      {(slackState === "show" || slackState === "linked") && (
        <SlackLinkSettingsCard state={slackState} />
      )}

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

      {/* ログアウト */}
      <SettingsCard title="ログアウト">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            このアカウントからログアウトします。
          </p>
          <LogoutButton />
        </div>
      </SettingsCard>
    </SettingsPageLayout>
  );
}
