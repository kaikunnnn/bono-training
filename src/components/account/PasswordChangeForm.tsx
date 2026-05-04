// src/components/account/PasswordChangeForm.tsx
// パスワード変更フォーム（アカウント設定ページ用 — Dialog版）
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Check } from "lucide-react";
import { SettingsCard } from "@/components/common/SettingsPageLayout";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth-error-messages";

export function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
        setError(translateAuthError(updateError.message));
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
      setIsOpen(false);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("パスワードの更新に失敗しました。しばらく経ってから再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError(null);
      formRef.current?.reset();
    }
  };

  return (
    <>
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
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
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

      {/* パスワード変更ダイアログ */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-noto-sans-jp">パスワード変更</DialogTitle>
            <DialogDescription className="font-noto-sans-jp">
              新しいパスワードを入力してください
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit}>
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

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
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
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
