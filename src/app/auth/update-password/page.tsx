"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, Lock, AlertCircle, Mail } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { translateAuthError } from "@/lib/auth-error-messages";
import { resetPassword } from "@/app/(auth)/actions";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSessionMissing(true);
      }
    });
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    setResendError(null);
    const result = await resetPassword(resendEmail);
    if (result.error) {
      setResendError(result.error);
    } else {
      setResendSuccess(true);
    }
    setIsResending(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      setIsSubmitting(false);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(translateAuthError(updateError.message));
      setIsSubmitting(false);
      return;
    }

    // パスワード更新成功後、移行ユーザーフラグを削除
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
    } catch (e) {
      // フラグ削除失敗はパスワード更新自体に影響しないので無視
      console.warn("Failed to clear migrated flag:", e);
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/mypage");
    }, 2000);
  };

  if (sessionMissing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle>リンクの有効期限が切れています</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              メールに届いたリンクが無効になっています。
              <br />
              メールアドレスを入力して新しいリンクを受け取ってください。
            </p>

            {resendSuccess ? (
              <div className="p-4 bg-green-50 rounded-lg text-center space-y-2">
                <Check className="w-6 h-6 text-green-600 mx-auto" />
                <p className="text-sm text-green-700 font-medium">
                  パスワード設定メールを送信しました
                </p>
                <p className="text-xs text-green-600">
                  メールをご確認ください（迷惑メールフォルダもご確認ください）
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="resend-email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="登録したメールアドレス"
                      className="pl-10"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {resendError && (
                  <p className="text-sm text-red-600">{resendError}</p>
                )}
                <Button type="submit" className="w-full" disabled={isResending}>
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "パスワード設定メールを再送する"
                  )}
                </Button>
              </form>
            )}

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:underline"
              >
                ログインページに戻る
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>パスワードを更新しました</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              マイページにリダイレクトします...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>新しいパスワードを設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            新しいパスワードを入力してください
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="8文字以上"
                required
                minLength={8}
              />
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

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : (
                "パスワードを更新"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:underline"
            >
              ログインページに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
