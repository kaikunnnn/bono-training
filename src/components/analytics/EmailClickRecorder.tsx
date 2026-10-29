"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logActivity } from "@/lib/activity-client";
import { parseEmailFrom } from "@/lib/activity-utils";

const STORAGE_PREFIX = "bono.activity.emailClick:";

/**
 * メールのリンク（?from=email_xxx）から来たことを活動ログに残す（#264 §6-1 email_click）。
 * site_visit は1人1日1回でクエリも捨てるため、その日すでに来ていた人がメールを押しても残らない。その穴を埋める。
 * LayoutWrapper でログイン時のみ描画する。同じタブで同じページを開き直したときは二重に送らない（sessionStorage）。
 */
export function EmailClickRecorder() {
  const pathname = usePathname();

  useEffect(() => {
    let from: string | null = null;
    try {
      from = parseEmailFrom(new URLSearchParams(window.location.search).get("from"));
    } catch {
      return;
    }
    if (!from) return;
    const path = window.location.pathname;
    const key = `${STORAGE_PREFIX}${from}:${path}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // storage が使えない環境では毎回送る
    }
    logActivity({ eventType: "email_click", path, meta: { from } });
  }, [pathname]);

  return null;
}
