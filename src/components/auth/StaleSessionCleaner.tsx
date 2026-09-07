"use client";

/**
 * 無効になった Supabase auth cookie の掃除役（#137-C / #136 関連）。
 *
 * refresh token が失効した cookie が残っていると、
 * - サーバー側の getUser() のたびに SDK 内部（auth-js の _recoverAndRefresh）が
 *   console.error を吐く（オプションで抑止できない）
 * - middleware の cookie 存在判定が「ログイン済み」と誤認する（#136 のループ原因）
 * ため、「cookie はあるのに認証は無効」をサーバーで検知したら、
 * このコンポーネントが SDK を通さず document.cookie で直接削除して再描画する。
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function StaleSessionCleaner() {
  const router = useRouter();

  useEffect(() => {
    const staleNames = document.cookie
      .split("; ")
      .map((c) => c.split("=")[0])
      .filter((name) => name.startsWith("sb-") && name.includes("-auth-token"));

    if (staleNames.length === 0) return;

    staleNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
    // cookie が消えた状態でサーバー状態を取り直す（以後 SDK のエラーログは出ない）
    router.refresh();
  }, [router]);

  return null;
}
