"use client";

import { useEffect } from "react";
import { logActivity } from "@/lib/activity-client";
import { toJstDateString } from "@/lib/activity-utils";

const STORAGE_PREFIX = "bono.activity.siteVisit:";

/**
 * ログイン中の来訪を 1人1日（日本時間）1回だけ記録する（#213 A1 site_visit）。
 * LayoutWrapper でログイン時のみ描画する。
 * 同じ日に何度もページを開いても Server Action を呼ばないよう localStorage で抑止する
 * （DB 側も部分一意インデックスで 1日1行に保たれるので、storage が使えなくても重複しない）。
 */
export function SiteVisitRecorder({ userId }: { userId: string }) {
  useEffect(() => {
    const today = toJstDateString();
    const key = `${STORAGE_PREFIX}${userId}`;
    try {
      if (window.localStorage.getItem(key) === today) return;
    } catch {
      // storage が使えない環境では毎回送る（DB 側で重複は弾かれる）
    }
    // その日最初に開いたページ（#232）。path 列に入る。
    // logActivity も既定で pathname を入れるが、来訪の分析で使う値なので明示する
    logActivity({ eventType: "site_visit", path: window.location.pathname });
    try {
      window.localStorage.setItem(key, today);
    } catch {
      // 無視
    }
  }, [userId]);

  return null;
}
