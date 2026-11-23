"use client";

import { useEffect, useState } from "react";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabGroup } from "@/components/ui/tab-group";
import { Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import { RegistrationFlowGuide } from "@/components/auth/RegistrationFlowGuide";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_LABEL,
  PASSWORD_TOO_SHORT_MESSAGE,
  isPasswordLongEnough,
} from "@/lib/auth-password";
import {
  SIGNUP_REQUEST_FAILED_MESSAGE,
  invalidFieldReason,
  isNextInternalError,
  reportSignupRequestFailed,
  trackSignupError,
  trackSignupStep,
} from "@/lib/auth-client-error";
import { signUp } from "../actions";
import { createClient } from "@/lib/supabase/client";

type TabId = "new" | "bono-member";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  // プランを選んでから来た人か（GA4 で分けて見る。#320）
  const hasPlan = !!redirectTo?.includes("intent_plan");

  const [activeTab, setActiveTab] = useState<TabId>("new");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace(redirectTo || "/");
      }
    };
    checkUser();
  }, [router, redirectTo]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    trackSignupStep("signup_submit", hasPlan);

    // Supabase に送る前に文字数を確かめる（#321）
    if (!isPasswordLongEnough(password)) {
      setError(PASSWORD_TOO_SHORT_MESSAGE);
      trackSignupError("password_too_short", hasPlan);
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      trackSignupError("password_mismatch", hasPlan);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      if (redirectTo) {
        formData.append("redirectTo", redirectTo);
      }

      const result = await signUp(formData);

      if (result?.error) {
        setError(result.error);
        trackSignupError("server", hasPlan);
      }
      // 成功時は signUp 内で redirect される
    } catch (err) {
      // redirect 等の Next.js 内部の制御はそのまま流す
      if (isNextInternalError(err)) throw err;
      // サーバーとの通信そのものが失敗した（通信切れ・デプロイ直後の食い違い等）。
      // 以前はボタンが戻るだけで何も表示されず、記録も残らなかった（#321 S5）
      setError(SIGNUP_REQUEST_FAILED_MESSAGE);
      reportSignupRequestFailed(err, email, hasPlan);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginHref = redirectTo
    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/login";

  return (
    <div className="container max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 font-noto-sans-jp text-text-primary">
        新規登録
      </h1>

      <TabGroup
        tabs={[
          { id: "new", label: "新規登録" },
          { id: "bono-member", label: "BONO会員の方" },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      {/* 新規登録タブ: メール/パスワードで直接登録 */}
      {activeTab === "new" && (
        <Card className="mt-4 rounded-3xl">
          <form
            onSubmit={handleSignUp}
            // ブラウザの入力チェック（メール形式・必須・最低文字数）で止まった欄を数える。
            // ここで止まると onSubmit は呼ばれず、これまで記録が残らなかった（#320）
            onInvalidCapture={(e) => {
              const reason = invalidFieldReason((e.target as HTMLElement).id);
              if (reason) trackSignupError(reason, hasPlan);
            }}
          >
            <CardContent className="pt-6 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={PASSWORD_MIN_LENGTH_LABEL}
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="new-password"
                    aria-describedby="signup-password-requirements"
                  />
                </div>
                <div id="signup-password-requirements">
                  <PasswordRequirements password={password} confirmPassword={confirmPassword} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">パスワード（確認）</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="もう一度入力"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                size="large"
                className="w-full font-noto-sans-jp"
                disabled={isSubmitting}
                onClick={() => trackSignupStep("signup_click", hasPlan)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? "登録中..." : "アカウントを作成"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* BONO会員タブ: 既存の外部登録ガイド */}
      {activeTab === "bono-member" && (
        <div className="mt-4">
          <RegistrationFlowGuide variant="page" />
        </div>
      )}

      {/* ログインへの導線 */}
      <p className="text-center mt-6 text-sm text-muted-foreground font-noto-sans-jp">
        すでにアカウントをお持ちの方は{" "}
        <IntentPrefetchLink href={loginHref} className="text-primary hover:underline">
          ログイン
        </IntentPrefetchLink>
      </p>
    </div>
  );
}
