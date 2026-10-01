"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { observeLessonIntro } from "@/lib/analytics/lesson-intro";
import { ActivityRecorder } from "@/components/analytics/ActivityRecorder";

export default function LessonIntroAnalytics({ lessonId, path, version, children }: {
  lessonId: string; path: string; version: string; children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return observeLessonIntro(root.current, { lessonId, path, version });
  }, [lessonId, path, version]);
  return (
    <div ref={root} style={{ display: "contents" }} data-lesson-intro={version}>
      {/* 活動ログ lesson_view（#213 A1） */}
      <ActivityRecorder eventType="lesson_view" lessonId={lessonId} path={path} />
      {children}
    </div>
  );
}
