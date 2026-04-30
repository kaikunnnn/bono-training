// src/app/profile/page.tsx — mainのスタイルに準拠 + 編集機能を維持
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { ProfileForm } from "./ProfileForm";
import {
  SettingsPageLayout,
  SettingsPageTitle,
  SettingsCard,
  SettingsField,
} from "@/components/common/SettingsPageLayout";

export const metadata: Metadata = {
  title: "プロフィール編集",
  description: "プロフィール情報を編集",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <SettingsPageLayout>
      <SettingsPageTitle>プロフィール編集</SettingsPageTitle>

      {/* ユーザー情報（表示のみ） */}
      <SettingsCard title="ユーザー情報">
        <div className="space-y-3">
          <SettingsField label="メールアドレス:">
            {user.email}
          </SettingsField>
        </div>
      </SettingsCard>

      {/* プロフィール編集フォーム */}
      <ProfileForm
        defaultValues={{
          displayName: user.user_metadata?.display_name || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
          bio: user.user_metadata?.bio || "",
        }}
      />
    </SettingsPageLayout>
  );
}
