"use client";

import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PremiumVideoLockProps {
  isLoggedIn?: boolean;
  /** ログイン後のリダイレクト先（例: /articles/some-slug） */
  redirectTo?: string;
}

/**
 * プレミアム動画ロック表示コンポーネント
 * mainからコピー＋最小変更（useNavigate→Link、useAuth→props）
 *
 * 「メンバーシップ登録へ」ボタンは /subscription に直接遷移（モーダル不要）
 */
export default function PremiumVideoLock({
  isLoggedIn = false,
  redirectTo,
}: PremiumVideoLockProps) {
  const loginHref = redirectTo
    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/login";
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
      {/* 背景パターン */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* ロックアイコン */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
          <Lock className="w-10 h-10 text-blue-600" strokeWidth={2} />
        </div>

        {/* メッセージ */}
        <h3 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-3">
          プレミアムコンテンツ
        </h3>
        <p className="font-noto-sans-jp text-sm text-gray-600 mb-6 leading-relaxed">
          この動画を視聴するにはメンバーシップの登録が必要です
        </p>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          {isLoggedIn ? (
            <Button
              asChild
              size="large"
              className="flex-1 font-noto-sans-jp text-base"
            >
              <Link href="/subscription">
                メンバーシップ登録へ
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="large"
                className="flex-1 font-noto-sans-jp text-base"
              >
                <Link href={loginHref}>
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインする
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="large"
                className="flex-1 font-noto-sans-jp text-base"
              >
                <Link href="/subscription">
                  <UserPlus className="mr-2 h-4 w-4" />
                  メンバーシップ登録へ
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
