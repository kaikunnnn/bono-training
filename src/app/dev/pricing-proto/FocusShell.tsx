"use client";

/**
 * 料金プロトタイプ専用のフォーカスモード枠（このページ用ローカル複製）。
 *
 * 見た目は掲示板投稿フローの本物 PostFlowShell を踏襲する:
 *   - bg-base + 上部 --training-gradient 帯（148px）
 *   - 左上に ghost の「✕ キャンセル」（共通 Button + lucide X）
 * ただし chrome（サイドバー/ヘッダー/フッター）を確実に覆うため、位置取りは
 * 比較ラボ FocusFrame と同じ `fixed inset-0 z-[100]`（z-50 のヘッダーより上）を使う。
 * ※本来はグローバル Layout.tsx の chrome 非表示リストにルート登録する方式だが、
 *   今回は共有 Layout.tsx を変更しないため、フルスクリーンシェルで擬似的に覆う。
 *
 * h1 はシェルに持たせない（ページ主見出しは中身側で1つだけ描画する）。
 */

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function FocusShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-base">
      {/* スクロール内で帯を絶対配置するための relative ラッパ */}
      <div className="relative min-h-full">
        {/* 上部装飾グラデ（DS --training-gradient トークン参照。生グラデ値は書かない） */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[148px] w-full"
          style={{ backgroundImage: "var(--training-gradient)" }}
          aria-hidden="true"
        />

        {/* コンテンツ（2枚カードが並ぶため 1040px 目安） */}
        <div className="relative mx-auto w-full max-w-[1040px] px-4 py-8">
          <div className="mb-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="-ml-5"
            >
              <X size={16} />
              キャンセル
            </Button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
