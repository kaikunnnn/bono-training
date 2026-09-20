import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyPageShell } from "./MyPageShell";
import { ViewAllButton } from "./_shared/ViewAllButton";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { BookmarksSection } from "./sections/BookmarksSection";
import { HistorySection } from "./sections/HistorySection";
import { ProgressSection } from "./sections/ProgressSection";
import { ProgressPreview } from "./sections/ProgressSectionClient";
import { getBookmarkedArticles } from "@/lib/services/bookmarks";
import { getViewHistory } from "@/lib/services/viewHistory";
import { getMypageLessonsByIds } from "@/lib/sanity";
import { getMypageProgressSnapshot } from "@/lib/services/progress";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/services/bookmarks", () => ({
  getBookmarkedArticles: vi.fn(),
  toggleBookmark: vi.fn(),
}));
vi.mock("@/lib/services/viewHistory", () => ({
  getViewHistory: vi.fn(),
}));
vi.mock("@/lib/sanity", () => ({
  getMypageLessonsByIds: vi.fn(),
}));
vi.mock("@/lib/services/progress", () => ({
  getMypageProgressSnapshot: vi.fn(),
  markLessonAsCompleted: vi.fn(),
}));

type Element = ReactElement<{ children?: ReactNode; href?: string }>;

function descendants(node: ReactNode): Element[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const element = child as Element;
    return [element, ...descendants(element.props.children)];
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("mypage performance contracts", () => {
  it("passes preview limits to the personal-data fetchers without limiting full tabs", async () => {
    vi.mocked(getBookmarkedArticles).mockResolvedValue([]);
    vi.mocked(getViewHistory).mockResolvedValue([]);

    await BookmarksSection({ userId: "member", mode: "preview" });
    await HistorySection({ userId: "member", mode: "preview" });
    expect(getBookmarkedArticles).toHaveBeenCalledWith("member", 4);
    expect(getViewHistory).toHaveBeenCalledWith("member", 4);

    await BookmarksSection({ userId: "member", mode: "full" });
    await HistorySection({ userId: "member", mode: "full" });
    expect(getBookmarkedArticles).toHaveBeenLastCalledWith("member", undefined);
    expect(getViewHistory).toHaveBeenLastCalledWith("member", undefined);
  });

  it("sends only two in-progress lessons through the preview client boundary", async () => {
    const lessons = ["one", "two", "three"].map((slug) => ({
      _id: slug,
      title: slug,
      slug: { current: slug },
      articleIds: [`${slug}-article`],
      quests: [{ articles: [{ _id: `${slug}-article`, title: slug, slug: { current: slug } }] }],
    }));
    vi.mocked(getMypageProgressSnapshot).mockResolvedValue({
      completedArticles: lessons.map((lesson) => ({
        lessonId: lesson._id,
        articleId: `${lesson._id}-article`,
        updatedAt: "2026-09-20T00:00:00Z",
      })),
      lessonStatuses: {
        one: "in_progress",
        two: "in_progress",
        three: "in_progress",
      },
    });
    vi.mocked(getMypageLessonsByIds).mockResolvedValue(lessons as never);

    const preview = await ProgressSection({ userId: "member", mode: "preview" });
    expect(getMypageLessonsByIds).toHaveBeenCalledWith(["one", "three", "two"]);
    expect(preview.type).toBe(ProgressPreview);
    expect(preview.props.inProgressLessons).toHaveLength(2);
    expect(preview.props.inProgressLessons.map((lesson: { _id: string }) => lesson._id))
      .toEqual(["one", "two"]);
  });

  it("does not request completed lessons for the all-tab preview", async () => {
    vi.mocked(getMypageProgressSnapshot).mockResolvedValue({
      completedArticles: [
        { lessonId: "active", articleId: "active-article", updatedAt: "2026-09-20T00:00:00Z" },
        { lessonId: "done", articleId: "done-article", updatedAt: "2026-09-19T00:00:00Z" },
      ],
      lessonStatuses: { done: "completed" },
    });
    vi.mocked(getMypageLessonsByIds).mockResolvedValue([]);

    await ProgressSection({ userId: "member", mode: "preview" });

    expect(getMypageLessonsByIds).toHaveBeenCalledWith(["active"]);
  });

  it("uses intent-prefetched links for all tabs without eager auth requests", () => {
    const links = descendants(MyPageShell({ activeTab: "favorite", children: null }))
      .filter((element) => element.type === IntentPrefetchLink);
    const tabLinks = links.filter((element) => element.props.href?.startsWith("/mypage"));

    expect(tabLinks.map((element) => element.props.href)).toEqual([
      "/mypage",
      "/mypage?tab=progress",
      "/mypage?tab=favorite",
      "/mypage?tab=history",
    ]);
    expect(tabLinks.find((element) => element.props.href === "/mypage?tab=favorite")?.props)
      .toMatchObject({ role: "tab", "aria-selected": true, "aria-current": "page" });
  });

  it("uses the same intent-prefetched route for preview view-all links", () => {
    const viewAll = ViewAllButton({ tab: "history" });
    expect(viewAll.type).toBe(IntentPrefetchLink);
    expect(viewAll.props).toMatchObject({
      href: "/mypage?tab=history",
      scroll: false,
    });
  });
});
