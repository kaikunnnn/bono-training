"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

/**
 * 通常signup（intentなし）完了時の歓迎トースト。
 *
 * signUp（src/app/(auth)/actions.ts）が着地先に `?welcome=1` を付けてリダイレクトし、
 * 着地ページで一度だけトーストを表示 → URLからフラグを除去する。
 *
 * intentフロー（登録直後に自動でStripe Checkoutへ遷移）ではフラグを付けないため、
 * ここでは何もしない。
 *
 * 重要: サーバーアクションのリダイレクト連鎖（/signup → / → /mypage?welcome=1）では、
 * クライアントのURLが確定するのはマウント後になる。そのため window.location を
 * マウント時に一度だけ読む実装だと未発火になる。ここでは useSearchParams でURL確定に
 * リアクティブに反応させる（発火条件を effect の依存に含める）。
 *
 * useSearchParams は静的プリレンダーをバイパスさせるため、呼び出し側（Layout）で
 * <Suspense> 境界に包み、バイパスを本コンポーネントだけに封じ込める。
 */
export function WelcomeToast() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const handled = useRef(false);

  const isWelcome = searchParams.get("welcome") === "1";

  useEffect(() => {
    if (!isWelcome) return;
    // React 19 dev の Strict Mode 二重実行 & 再レンダーガード
    if (handled.current) return;
    handled.current = true;

    toast({
      title: "ようこそ！アカウントが作成されました",
      description: "さっそくBONOでデザインを始めましょう。",
      duration: 6000,
    });

    // 他のクエリ（例: /mypage?tab=...）は保持したまま welcome だけ除去。
    // サーバー再レンダーを起こさない history.replaceState で消す。
    const params = new URLSearchParams(window.location.search);
    params.delete("welcome");
    const query = params.toString();
    const newUrl =
      window.location.pathname + (query ? `?${query}` : "") + window.location.hash;
    window.history.replaceState(null, "", newUrl);
  }, [isWelcome, toast]);

  return null;
}
