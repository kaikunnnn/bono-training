"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * 軸A2: フォーカスモード枠。
 * fixed inset-0 の全画面オーバーレイでアプリのchrome(ヘッダー/ナビ/フッター)を覆い隠す。
 * 背景はテーマ背景（bg-background = 装飾ではないテーマ変数）。
 * ヘッダーが z-50 のため、確実に覆うよう z-[100] を使用（装飾ではなく機能上の指定）。
 */
export function FocusFrame({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-background">
      <div className="flex justify-end p-4">
        <button
          type="button"
          aria-label="閉じる"
          className="border px-3 py-1 text-base"
          onClick={handleClose}
        >
          ×
        </button>
      </div>
      <div className="px-4 pb-12">{children}</div>
    </div>
  );
}
