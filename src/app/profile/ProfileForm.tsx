// src/app/profile/ProfileForm.tsx — shadcn/ui コンポーネント使用
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Check } from "lucide-react";
import { SettingsCard } from "@/components/common/SettingsPageLayout";
import { updateProfile, type ProfileData } from "./actions";

interface ProfileFormProps {
  defaultValues: ProfileData;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data: ProfileData = {
      displayName: formData.get("displayName") as string,
      avatarUrl: formData.get("avatarUrl") as string,
      bio: formData.get("bio") as string,
    };

    const result = await updateProfile(data);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <SettingsCard title="プロフィール設定">
        <div className="space-y-6">
          {/* アバター */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} alt="アバター" />
              <AvatarFallback className="text-2xl">
                {defaultValues.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatarUrl">アバターURL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.png"
                defaultValue={defaultValues.avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                画像のURLを入力してください
              </p>
            </div>
          </div>

          {/* 表示名 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="表示名を入力"
              defaultValue={defaultValues.displayName}
            />
          </div>

          {/* 自己紹介 */}
          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="自己紹介を入力（任意）"
              rows={4}
              defaultValue={defaultValues.bio}
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
              <Check className="w-4 h-4" />
              プロフィールを更新しました
            </div>
          )}
        </div>

        {/* 保存ボタン */}
        <div className="mt-6 pt-6 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "保存する"
            )}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}
