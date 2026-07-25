"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { resetPassword, verifyEmailOtp } from "../actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setStep("code");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verifyEmailOtp(email, code);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "code") {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>確認コードを入力</CardTitle>
            <CardDescription>
              {email} に6桁のコードを送信しました。
              <br />
              メールに記載のコードを入力してください。
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">確認コード（6桁）</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    className="pl-10 text-center text-2xl tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-muted-foreground">
                コードが届かない場合は迷惑メールフォルダをご確認ください。
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="large"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button
                type="submit"
                size="large"
                disabled={isSubmitting || code.length !== 6}
              >
                {isSubmitting ? "確認中..." : "コードを確認"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>パスワードリセット</CardTitle>
          <CardDescription>
            登録したメールアドレスを入力してください。6桁の確認コードを送信します。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="large"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <Button type="submit" size="large" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "確認コードを送信"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
