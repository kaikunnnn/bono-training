"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegistrationFlowGuide } from "@/components/auth/RegistrationFlowGuide";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  // 既にログインしている場合はホームにリダイレクト
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace("/");
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="container max-w-md mx-auto py-10">
      {/* ページタイトル */}
      <h1 className="text-2xl font-bold mb-6 font-noto-sans-jp">
        新規登録
      </h1>

      <RegistrationFlowGuide variant="page" />

      {/* ログインへの導線 */}
      <p className="text-center mt-6 text-sm text-muted-foreground font-noto-sans-jp">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-primary hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
