import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  trackArticleVideoComplete,
  trackArticleVideoPlay,
  trackArticleVideoProgress,
} from "@/lib/activity-client";
import { recordActivity } from "@/lib/services/activity";
import {
  trackVideoComplete,
  trackVideoPlay,
  trackVideoProgress,
} from "@/lib/analytics";

vi.mock("@/lib/services/activity", () => ({
  recordActivity: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  trackVideoPlay: vi.fn(),
  trackVideoProgress: vi.fn(),
  trackVideoComplete: vi.fn(),
}));

const target = { articleId: "article-1", lessonId: "lesson-1", title: "記事タイトル" };

describe("記事の動画を GA4 と活動ログに送る（#262）", () => {
  beforeEach(() => {
    vi.mocked(recordActivity).mockClear();
    vi.mocked(trackVideoPlay).mockClear();
    vi.mocked(trackVideoProgress).mockClear();
    vi.mocked(trackVideoComplete).mockClear();
    document.cookie = "sb-local-auth-token=x; path=/";
  });

  it("video_play: article_id / lesson_id を入れる", () => {
    trackArticleVideoPlay(target);
    expect(trackVideoPlay).toHaveBeenCalledWith("article-1", "記事タイトル");
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "video_play",
        articleId: "article-1",
        lessonId: "lesson-1",
      })
    );
  });

  it("video_progress: meta.percent を入れる", () => {
    trackArticleVideoProgress(target, 50);
    expect(trackVideoProgress).toHaveBeenCalledWith("article-1", "記事タイトル", 50);
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "video_progress",
        articleId: "article-1",
        lessonId: "lesson-1",
        meta: { percent: 50 },
      })
    );
  });

  it("video_complete: レッスン無しの記事は lesson_id を空にする", () => {
    trackArticleVideoComplete({ articleId: "article-2", lessonId: "", title: "単発" });
    expect(trackVideoComplete).toHaveBeenCalledWith("article-2", "単発");
    const input = vi.mocked(recordActivity).mock.calls[0][0];
    expect(input.eventType).toBe("video_complete");
    expect(input.articleId).toBe("article-2");
    expect(input.lessonId).toBeUndefined();
  });

  it("未ログイン（auth cookie 無し）は活動ログを送らず GA4 だけ送る", () => {
    document.cookie = "sb-local-auth-token=; path=/; max-age=0";
    trackArticleVideoPlay(target);
    expect(trackVideoPlay).toHaveBeenCalledOnce();
    expect(recordActivity).not.toHaveBeenCalled();
  });
});
