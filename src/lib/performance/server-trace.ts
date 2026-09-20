import "server-only";

export type ServerTraceLabel =
  | "auth.get_user"
  | "layout.user_provider"
  | "subscription.query"
  | "subscription.total"
  | "top.subscription"
  | "top.cms.latest"
  | "top.cms.guides"
  | "top.cms.lessons"
  | "top.cms.achievements"
  | "article.metadata.cms"
  | "article.metadata.production_slugs"
  | "article.page.cms"
  | "article.page.subscription"
  | "article.page.bookmark"
  | "article.page.progress"
  | "article.layout.cms"
  | "article.layout.lesson_progress"
  | "article.layout.lesson_status"
  | "lesson.metadata.cms"
  | "lesson.page.cms"
  | "lesson.page.subscription"
  | "lesson.page.progress"
  | "mypage.progress.snapshot"
  | "mypage.progress.cms"
  | "mypage.bookmarks"
  | "mypage.history"
  | "questions.list.access"
  | "questions.list.data"
  | "questions.detail.reactions";

/**
 * Local preview only: log an allow-listed step name, duration and outcome.
 * Never pass request data or returned values to this helper.
 */
export async function traceServerStep<T>(
  label: ServerTraceLabel,
  operation: () => Promise<T>,
): Promise<T> {
  if (process.env.PERF_TRACE_SERVER !== "1") return operation();

  const start = performance.now();
  try {
    const result = await operation();
    console.info(JSON.stringify({
      level: "info",
      category: "performance_trace",
      label,
      durationMs: Math.round(performance.now() - start),
      outcome: "ok",
    }));
    return result;
  } catch (error) {
    console.info(JSON.stringify({
      level: "info",
      category: "performance_trace",
      label,
      durationMs: Math.round(performance.now() - start),
      outcome: "error",
    }));
    throw error;
  }
}
