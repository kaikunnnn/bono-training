/**
 * コンテンツガイド（診断）の計測。
 *
 * 既存の trackEvent（GA4）を使う。ログイン状態には依存しない（全ユーザーで送る）。
 * trackEvent は本番ホスト以外では何もしないため、開発中は console に出して確認できるようにする。
 */

import { trackEvent } from "@/lib/analytics";

export type ContentGuideEvent =
  | "content_guide_goal_select"
  | "content_guide_result_view"
  | "content_guide_lesson_click";

export function trackContentGuide(event: ContentGuideEvent, params: Record<string, unknown>): void {
  trackEvent(event, params);
  if (process.env.NODE_ENV !== "production") {
    console.info(`[content-guide] ${event}`, params);
  }
}
