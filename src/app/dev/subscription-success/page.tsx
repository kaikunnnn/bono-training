/**
 * /dev/subscription-success — 課金登録後（決済完了）画面の現状確認
 *
 * 本番の /subscription/success は Stripe チェックアウト → Webhook 処理 →
 * DB 参照を前提とするため、開発環境で任意の状態を再現しづらい。
 * ここでは同画面がレンダリングする SubscriptionSuccessContent を、
 * 各状態（成功 / ローディング / エラー、新規 / プラン変更、プラン種別、期間）に
 * 切り替えて確認できるようにする。改善検討のたたき台。
 */

import { Metadata } from "next";
import Link from "next/link";
import { PreviewSwitcher } from "./PreviewSwitcher";

export const metadata: Metadata = {
  title: "課金登録後の画面 現状確認 (/dev/subscription-success)",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-8 pb-4 border-b border-gray-200">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            <Link href="/dev" className="hover:text-text-primary underline">
              Dev Portal
            </Link>{" "}
            / 課金登録後の画面
          </p>
          <h1 className="text-2xl font-bold text-text-primary font-rounded-mplus mt-1">
            課金登録後（決済完了）画面の現状確認
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            本番の <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/subscription/success</code> が
            表示する画面（<code className="text-xs bg-gray-100 px-1 py-0.5 rounded">SubscriptionSuccessContent</code>）を、
            Stripe / Webhook / DB なしでそのまま描画している。上のパネルで状態を切り替えて、
            改善前の現状を確認できる。ここで見えているものが実画面そのもの。
          </p>
        </header>

        <PreviewSwitcher />
      </div>
    </div>
  );
}
