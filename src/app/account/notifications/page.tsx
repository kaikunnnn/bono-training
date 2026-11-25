// src/app/account/notifications/page.tsx — 通知種別ごとのオン/オフ設定ページ
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { withEmailFrom } from "@/lib/top-redirect";
import { getCurrentUser } from "@/lib/subscription";
import { getNotificationPreferences } from "@/lib/services/notification-preferences";
import {
  SettingsBackLink,
  SettingsPageLayout,
  SettingsPageTitle,
  SettingsCard,
} from "@/components/common/SettingsPageLayout";
import { NotificationPreferencesForm } from "@/components/account/NotificationPreferencesForm";
import { PushNotificationToggle } from "@/components/account/PushNotificationToggle";
import { MemberMailToggle } from "@/components/account/MemberMailToggle";
import { getMailStore } from "@/lib/member-mail/runtime";
import { isMemberMailEnabled } from "@/lib/member-mail/self-settings";

export const metadata: Metadata = {
  title: "通知設定",
  description: "コメントやリアクションの通知と、お知らせメールをオン/オフできます",
};

export default async function NotificationSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [user, { from }] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    // メールの印は戻り先に付けて、ログイン後に email_click を残す（メールから設定画面へ来る想定・#327-C）
    redirect(
      `/login?reauth=1&redirectTo=${encodeURIComponent(withEmailFrom("/account/notifications", from))}`
    );
  }

  const [preferences, mailEnabled] = await Promise.all([
    getNotificationPreferences(),
    readMemberMailEnabled(user.id),
  ]);

  return (
    <SettingsPageLayout>
      <SettingsBackLink href="/account">アカウント情報</SettingsBackLink>
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

      <SettingsCard title="メール">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            オフにすると、BONOからのお知らせメールが届かなくなります。お支払い・契約・ログインに関するメールは、この設定にかかわらず届きます。
          </p>
          <MemberMailToggle initialEnabled={mailEnabled} />
        </div>
      </SettingsCard>
    </SettingsPageLayout>
  );
}

/** お知らせメールを受け取っているか（#327-C）。読めなければ null（スイッチを切り替えられない表示にする） */
async function readMemberMailEnabled(userId: string): Promise<boolean | null> {
  const store = getMailStore();
  if (!store) return null;
  try {
    return await isMemberMailEnabled(store, userId);
  } catch (error) {
    console.error("[member-mail] settings read failed:", error instanceof Error ? error.message : "unknown");
    return null;
  }
}
