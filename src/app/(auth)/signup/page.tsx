"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabGroup } from "@/components/ui/tab-group";
import { Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import { RegistrationFlowGuide } from "@/components/auth/RegistrationFlowGuide";
import { signUp } from "../actions";
import { createClient } from "@/lib/supabase/client";

type TabId = "new" | "bono-member";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

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
      }
      // 成功時は signUp 内で redirect される
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginHref = redirectTo
    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/login";

  return (
    <div className="container max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 font-noto-sans-jp">
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
          <form onSubmit={handleSignUp}>
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
                    placeholder="8文字以上"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
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
                    minLength={8}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" size="large" className="w-full font-noto-sans-jp" disabled={isSubmitting}>
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
        <Link href={loginHref} className="text-primary hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
