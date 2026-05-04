"use client";

import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ContentPreviewOverlayProps {
  isLoggedIn?: boolean;
}

/**
 * コンテンツプレビューオーバーレイ
 * プレミアムコンテンツの続きをロックする際に表示
 *
 * - 未ログイン: 「ログインする」+「メンバーシップ登録へ」→ /subscription
 * - ログイン済み・サブスクなし: 「メンバーシップ登録へ」→ /subscription
 */
export default function ContentPreviewOverlay({
  isLoggedIn = false,
}: ContentPreviewOverlayProps) {
  return (
    <div className="relative w-full">
      {/* グラデーション（コンテンツにかぶせる） */}
      <div
        className="absolute inset-x-0 -top-20 h-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* CTA */}
      <div className="bg-white py-12 text-center">
        {/* ロックアイコン */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <Lock className="w-8 h-8 text-blue-600" strokeWidth={2} />
        </div>

        {/* メッセージ */}
        <h3 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-6">
          続きを読むにはメンバーシップの登録が必要です
        </h3>

        {/* CTAボタン - ユーザー状態で分岐 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto px-4">
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
                <Link href="/login">
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
