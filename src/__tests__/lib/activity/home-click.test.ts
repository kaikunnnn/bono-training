import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACTIVITY_EVENT_TYPES,
  buildActivityRow,
  buildHomeClickParams,
  classifyHomeHref,
  type HomeClickTracking,
} from "@/lib/activity-utils";
import { trackHomeClick } from "@/lib/activity-client";
import { recordActivity } from "@/lib/services/activity";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/services/activity", () => ({
  recordActivity: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("DB の CHECK 制約とアプリの種類一覧が一致する", () => {
  it("最新のマイグレーションの event_type 一覧 = ACTIVITY_EVENT_TYPES", () => {
    const dir = join(process.cwd(), "supabase/migrations");
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .filter((name) =>
        /member_activity_events[\s\S]*event_type[\s\S]*CHECK|CHECK \(event_type IN/.test(
          readFileSync(join(dir, name), "utf8")
        )
      );
    const latest = readFileSync(join(dir, files[files.length - 1]), "utf8");
    const list = latest.match(/event_type IN \(([\s\S]*?)\)\)/)?.[1] ?? "";
    const values = [...list.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    expect(values).toEqual([...ACTIVITY_EVENT_TYPES]);
  });
});

describe("buildHomeClickParams", () => {
  it("snake_case のパラメータにし、ID は列用に分ける", () => {
    expect(
      buildHomeClickParams({
        surface: "mypage",
        section: "bookmarks",
        itemType: "article",
        position: 2,
        contentId: "slug-1",
        articleId: "article-id",
      })
    ).toEqual({
      params: {
        surface: "mypage",
        section: "bookmarks",
        item_type: "article",
        position: 2,
        content_id: "slug-1",
      },
      articleId: "article-id",
      lessonId: undefined,
    });
  });

  it("position・content_id は任意。不正な position は落とす", () => {
    expect(
      buildHomeClickParams({ surface: "top", section: "new_content", itemType: "view_all", position: 0 })
        .params
    ).toEqual({ surface: "top", section: "new_content", item_type: "view_all" });
    expect(
      buildHomeClickParams({ surface: "top", section: "x", itemType: "lesson", position: 1.5 }).params
    ).not.toHaveProperty("position");
  });

  it("不正な surface / item_type は other に丸め、値は100文字に切る（GA4 の上限）", () => {
    const { params } = buildHomeClickParams({
      surface: "evil",
      section: "s".repeat(150),
      itemType: "hack",
      contentId: "c".repeat(150),
    } as unknown as HomeClickTracking);
    expect(params.surface).toBe("other");
    expect(params.item_type).toBe("other");
    expect(String(params.section)).toHaveLength(100);
    expect(String(params.content_id)).toHaveLength(100);
    for (const key of Object.keys(params)) expect(key.length).toBeLessThanOrEqual(40);
  });

  it("meta として Server Action の検証を通る", () => {
    const { params } = buildHomeClickParams({ surface: "root", section: "guide", itemType: "guide", position: 1 });
    expect(buildActivityRow({ eventType: "home_click", meta: params })?.meta).toEqual(params);
  });
});

describe("classifyHomeHref（あたらしいコンテンツの種類分け）", () => {
  it.each([
    ["/events/oct-meetup", "event", "oct-meetup"],
    ["/questions/abc123", "question", "abc123"],
    ["/lessons/figmabeginner", "lesson", "figmabeginner"],
    ["/contents/hello?x=1", "article", "hello"],
    ["/guide/portfolio-01", "guide", "portfolio-01"],
    ["/blog/post", "blog", "post"],
    ["/stories/someone", "story", "someone"],
    ["/roadmap/ux-design-basic", "roadmap", "ux-design-basic"],
    ["/roadmap", "roadmap", undefined],
    ["/updates", "update", undefined],
    ["https://note.com/someone/n/abc", "output", undefined],
    ["/how-to/feedback", "other", undefined],
    ["/events/%E3%81%82", "event", "あ"],
  ])("%s → %s", (href, itemType, contentId) => {
    const result = classifyHomeHref(href);
    expect(result.itemType).toBe(itemType);
    expect(result.contentId).toBe(contentId);
  });
});

describe("trackHomeClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = "sb-local-auth-token=x; path=/";
  });

  it("GA4 home_click と活動ログ home_click を送る（user_id は送らない）", () => {
    trackHomeClick({
      surface: "top",
      section: "lesson_highlight",
      itemType: "lesson",
      position: 4,
      contentId: "figmabeginner",
      lessonId: "lesson-id",
    });
    const params = {
      surface: "top",
      section: "lesson_highlight",
      item_type: "lesson",
      position: 4,
      content_id: "figmabeginner",
    };
    expect(trackEvent).toHaveBeenCalledWith("home_click", params);
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toContain("user");
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "home_click",
        lessonId: "lesson-id",
        articleId: undefined,
        meta: params,
      })
    );
  });

  it("GA4 が失敗しても活動ログは送る", () => {
    vi.mocked(trackEvent).mockImplementationOnce(() => {
      throw new Error("ga");
    });
    trackHomeClick({ surface: "mypage", section: "history", itemType: "article", position: 1 });
    expect(recordActivity).toHaveBeenCalledTimes(1);
  });
});
