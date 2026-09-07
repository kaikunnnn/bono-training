"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { recordBoardSeen } from "@/lib/services/board-views";

/**
 * 掲示板一覧（/questions）を開いたら既読を記録するクライアント副作用（掲示板の新着ドット）。
 *
 * 記事ページの閲覧記録（recordViewHistory）と同じ発想で、Server Component から
 * 副作用を直接呼ばず、マウント時に1回だけ recordBoardSeen() を呼ぶ。
 *
 * サイドバーの新着ドットはルートレイアウトに存在し、App Router のレイアウトは
 * ソフトナビゲーションでは再レンダリングされない。そのため記録後に router.refresh() を
 * 呼び、レイアウト（＝ドット）を再計算させてドットを消す。
 *
 * ログイン済みユーザーでのみレンダリングする想定（recordBoardSeen 側でも未認証は no-op）。
 */
export function BoardSeenRecorder() {
  const router = useRouter();
  const didRun = useRef(false);

  useEffect(() => {
    // StrictMode の二重実行や再マウントで多重に走らせない（upsert は冪等だが refresh を1回に抑える）
    if (didRun.current) return;
    didRun.current = true;

    void recordBoardSeen()
      .then(() => {
        // レイアウト（新着ドット）を再計算させてドットを消す
        router.refresh();
      })
      .catch((e) => {
        console.error("[BoardSeenRecorder] recordBoardSeen", e);
      });
  }, [router]);

  return null;
}
