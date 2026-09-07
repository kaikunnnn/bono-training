"use client";

import { useEffect } from "react";

/**
 * Service Worker（/sw.js）の登録だけを担う不可視コンポーネント。
 *
 * - 登録自体は通知許可を要求しない（許可要求は設定トグルのクリック起点で別途行う）。
 *   そのためレイアウトに常設しても副作用が無い。
 * - 対応ブラウザ（serviceWorker あり）でのみ登録する。
 * - 失敗しても握りつぶす（SW登録の失敗でアプリを壊さない）。
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 登録失敗は無視（プッシュ通知が使えないだけで他機能に影響しない）
    });
  }, []);

  return null;
}
