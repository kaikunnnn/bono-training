"use client";

/**
 * 15分フィードバック トップページのクライアントコンポーネント
 * - 応募ボタンのクリックハンドリング（ログイン/プランチェック）
 *
 * mainブランチの FeedbackApplyIndex 内のボタン部分を移植
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackApplyClientProps {
  isLoggedIn: boolean;
  canApply: boolean;
  /** ヘッダー位置かCTA位置か */
  position: "header" | "cta";
}

export function FeedbackApplyClient({
  isLoggedIn,
  canApply,
  position,
}: FeedbackApplyClientProps) {
  const router = useRouter();

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      router.push("/login?redirectTo=/feedback-apply/submit");
      return;
    }
    if (!canApply) {
      router.push("/subscription");
      return;
    }
    router.push("/feedback-apply/submit");
  };

  // 非メンバーの場合はサブスクリプションページへのリンクボタンを表示
  const buttonText = isLoggedIn && !canApply ? "メンバーになって応募" : "応募する";

  if (position === "header") {
    if (isLoggedIn && !canApply) {
      return (
        <Button
          asChild
          size="large"
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold"
        >
          <Link href="/subscription">
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    }

    return (
      <Button
        onClick={handleApplyClick}
        size="large"
        className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold"
      >
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  // CTA position
  if (isLoggedIn && !canApply) {
    return (
      <>
        <Button
          asChild
          size="lg"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-3 shadow-sm"
        >
          <Link href="/subscription">
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <p className="mt-4 text-sm text-muted-foreground">
          15分フィードバックはStandard・Growthプラン限定の機能です。
          <Link
            href="/subscription"
            className="text-primary underline ml-1"
          >
            プランを確認する
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleApplyClick}
        size="lg"
        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-3 shadow-sm"
      >
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </>
  );
}
