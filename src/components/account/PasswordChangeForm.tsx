// src/components/account/PasswordChangeForm.tsx
// パスワード変更フォーム（アカウント設定ページ用）
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { SettingsCard } from "@/components/common/SettingsPageLayout";
import { createClient } from "@/lib/supabase/client";

export function PasswordChangeForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // バリデーション
    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }

      // パスワード更新成功後、移行ユーザーフラグを削除
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clear-migrated-flag`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
        }
      } catch {
        // フラグ削除失敗はパスワード更新自体に影響しないので無視
        console.warn("Failed to clear migrated flag (non-critical)");
      }

      setSuccess(true);
      setIsEditing(false);
      // フォームをリセット
      e.currentTarget.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("パスワードの更新に失敗しました。しばらく経ってから再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  if (!isEditing) {
    return (
      <SettingsCard title="パスワード">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-noto-sans-jp text-sm text-gray-600">
              現在のパスワード:
            </span>
            <span className="ml-2 font-noto-sans-jp text-gray-400">
              ••••••••••••
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            変更
          </Button>
        </div>

        {/* 成功メッセージ */}
        {success && (
          <div className="mt-3 p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            パスワードを更新しました
          </div>
        )}
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title="パスワード変更">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="8文字以上"
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              パスワードは8文字以上で設定してください
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              required
              minLength={8}
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                更新中...
              </>
            ) : (
              "パスワードを更新"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
