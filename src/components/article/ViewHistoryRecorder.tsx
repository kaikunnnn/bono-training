"use client";

import { useEffect, useRef } from "react";
import { recordViewHistory } from "@/lib/services/viewHistory";

interface ViewHistoryRecorderProps {
  articleId: string;
}

/**
 * 記事の閲覧履歴を記録するコンポーネント
 * マウント時に一度だけ閲覧を記録する
 */
export function ViewHistoryRecorder({ articleId }: ViewHistoryRecorderProps) {
  const hasRecorded = useRef(false);

  useEffect(() => {
    // 二重記録を防止
    if (hasRecorded.current) return;
    hasRecorded.current = true;

    // 閲覧履歴を記録（非同期、エラーは握り潰す）
    recordViewHistory(articleId).catch((error) => {
      console.error("Failed to record view history:", error);
    });
  }, [articleId]);

  // 何もレンダリングしない
  return null;
}
