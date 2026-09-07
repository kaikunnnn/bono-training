// src/app/account/notifications/page.tsx — 通知種別ごとのオン/オフ設定ページ
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { getNotificationPreferences } from "@/lib/services/notification-preferences";
import {
  SettingsPageLayout,
  SettingsPageTitle,
  SettingsCard,
} from "@/components/common/SettingsPageLayout";
import { NotificationPreferencesForm } from "@/components/account/NotificationPreferencesForm";
import { PushNotificationToggle } from "@/components/account/PushNotificationToggle";

export const metadata: Metadata = {
  title: "通知設定",
  description: "コメントやリアクションの通知を種類ごとにオン/オフできます",
};

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?reauth=1&redirectTo=/account/notifications");
  }

  const preferences = await getNotificationPreferences();

  return (
    <SettingsPageLayout>
      <SettingsPageTitle>通知設定</SettingsPageTitle>

      <SettingsCard title="サイト内通知">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            オフにした種類は通知が作成されなくなります。オンに戻すと、それ以降の通知から再び受け取れます。
          </p>
          <NotificationPreferencesForm initialPreferences={preferences} />
        </div>
      </SettingsCard>

      <SettingsCard title="プッシュ通知（ベータ）">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            スマホやPCに、サイトを開いていないときでも通知を届けます。オンにするとこの端末で通知を受け取れます。
          </p>
          <PushNotificationToggle />
        </div>
      </SettingsCard>
    </SettingsPageLayout>
  );
}
