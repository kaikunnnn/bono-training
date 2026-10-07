"use client";

import { useEffect, useRef } from "react";
import { logActivity } from "@/lib/activity-client";
import type { ActivityEventType } from "@/lib/activity-utils";

interface ActivityRecorderProps {
  /** マウント時に記録するイベント（閲覧系） */
  eventType: Extract<
    ActivityEventType,
    "article_view" | "lesson_view" | "questions_view" | "event_view"
  >;
  articleId?: string;
  lessonId?: string;
  path?: string;
  meta?: Record<string, unknown>;
}

/**
 * ページを開いたときに活動ログを1回記録する（#213 A1）。何も描画しない。
 * マウント（=実際の表示）でだけ記録するので、サーバー描画や Link の先読みでは記録されない。
 * 未ログインは logActivity / Server Action 側で何もしない。
 */
export function ActivityRecorder({
  eventType,
  articleId,
  lessonId,
  path,
  meta,
}: ActivityRecorderProps) {
  const recordedKey = useRef<string | null>(null);
  const key = [eventType, articleId, lessonId, path].join("|");

  useEffect(() => {
    // Strict Mode の二重実行・再レンダーで重複記録しない
    if (recordedKey.current === key) return;
    recordedKey.current = key;
    logActivity({ eventType, articleId, lessonId, path, meta });
    // meta は記録時点の値だけ使う（オブジェクト参照の変化で再記録しない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
