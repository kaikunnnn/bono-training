"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle, Mail } from "lucide-react";
import { resetPassword } from "@/app/(auth)/actions";

export default function AuthCodeErrorPage() {
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

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
            メールのリンクは1度しか使えません。
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
