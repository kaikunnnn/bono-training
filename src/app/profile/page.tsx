import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/subscription";
import { ProfileForm } from "./ProfileForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <section className="bg-background border-b">
        <div className="container px-4 py-8 sm:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mypage">
                <ArrowLeft className="w-4 h-4 mr-2" />
                マイページ
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">プロフィール編集</h1>
          <p className="text-muted-foreground mt-1">
            あなたのプロフィール情報を更新できます
          </p>
        </div>
      </section>

      {/* フォーム */}
      <section className="container px-4 py-8 sm:px-8">
        <div className="max-w-xl mx-auto">
          <ProfileForm
            defaultValues={{
              displayName: user.user_metadata?.display_name || "",
              avatarUrl: user.user_metadata?.avatar_url || "",
              bio: user.user_metadata?.bio || "",
            }}
          />
        </div>
      </section>
    </div>
  );
}
