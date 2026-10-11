// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAllArticles,
  getAllEvents,
  getAllBlogSlugs,
  getAllFeedbackSlugs,
  getAllGuidesFromSanity,
  getAllLessonSlugs,
  getAllRoadmapSlugs,
} from "@/lib/sanity";
import { LEGACY_ONLY_CONTENT_SLUGS } from "@/lib/migration/legacy-only-content-slugs";
import { LEGACY_PUBLIC_ARTICLE_SLUGS } from "@/lib/seo/legacyPublicArticles";
import sitemap from "./sitemap";

vi.mock("@/lib/sanity", () => ({
  getAllArticles: vi.fn(),
  getAllBlogSlugs: vi.fn(),
  getAllFeedbackSlugs: vi.fn(),
  getAllGuidesFromSanity: vi.fn(),
  getAllLessonSlugs: vi.fn(),
  getAllRoadmapSlugs: vi.fn(),
  getQuestionsForSitemap: vi.fn(async () => []),
  getAllEvents: vi.fn(async () => []),
  getStoriesList: vi.fn(async () => [
    { _id: "s1", title: "Story", slug: { _type: "slug", current: "wake" }, publishedAt: "2026-01-01" },
    { _id: "s2", title: "Paid story", slug: { _type: "slug", current: "paid-story" }, publishedAt: "2026-01-01", isPremium: true },
    // 検索に戻す会員限定ストーリー（rebono#18 INDEXABLE_PREMIUM_STORIES）
    { _id: "s3", title: "Indexable paid story", slug: { _type: "slug", current: "howtobedesigner-mone" }, publishedAt: "2026-01-01", isPremium: true },
  ]),
  getTrainingListFromSanity: vi.fn(async () => [
    { _id: "t1", title: "Training", slug: " book-lending-system " },
    { _id: "t2", title: "No slug", slug: "" },
  ]),
}));

afterEach(() => vi.restoreAllMocks());

describe("sitemap", () => {
  it("only includes legacy public articles handled by the production rewrite", () => {
    expect(LEGACY_PUBLIC_ARTICLE_SLUGS.size).toBe(29);
    expect(
      [...LEGACY_PUBLIC_ARTICLE_SLUGS].every((slug) =>
        LEGACY_ONLY_CONTENT_SLUGS.has(slug),
      ),
    ).toBe(true);
  });

  it("keeps free article URLs stable without reading its own published sitemap", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([
      { _id: "free", title: "Free", slug: { current: "free-article" } },
      { _id: "paid", title: "Paid", slug: { current: "paid-article" }, isPremium: true },
      { _id: "paid-legacy", title: "Paid legacy", slug: { current: "question-ui-contrast" }, isPremium: true },
      {
        _id: "duplicate",
        title: "Guide copy",
        slug: { current: "beginner-to-uiux-designer-examples" },
      },
    ]);
    vi.mocked(getAllGuidesFromSanity).mockResolvedValue([
      {
        _id: "guide-1",
        title: "Guide copy",
        slug: "beginner-to-uiux-designer-examples",
        description: "",
        category: "career",
        author: "BONO",
        publishedAt: "2025-02-14T00:00:00.000Z",
        sanityUpdatedAt: "2026-09-15T00:00:00.000Z",
      },
      {
        _id: "guide-2",
        title: "Paid guide",
        slug: "paid-guide",
        description: "",
        category: "career",
        author: "BONO",
        publishedAt: "2025-02-14T00:00:00.000Z",
        isPremium: true,
      },
    ]);
    vi.mocked(getAllLessonSlugs).mockResolvedValue([]);
    vi.mocked(getAllFeedbackSlugs).mockResolvedValue([]);
    vi.mocked(getAllBlogSlugs).mockResolvedValue([]);
    vi.mocked(getAllRoadmapSlugs).mockResolvedValue([]);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const firstEntries = await sitemap();
    const first = firstEntries.map(({ url }) => new URL(url).pathname);
    const second = (await sitemap()).map(({ url }) => new URL(url).pathname);

    expect(first).toEqual(second);
    expect(first).toContain("/contents/free-article");
    expect(first).toContain("/contents/designer-uiux-mac-2025");
    expect(first).not.toContain("/contents/figma-ru-men-taitoru1-intoro");
    expect(first).not.toContain("/contents/question-ui-contrast");
    expect(first).toContain("/guide/beginner-to-uiux-designer-examples");
    expect(first).not.toContain("/contents/paid-article");
    expect(first).not.toContain("/guide/paid-guide");
    expect(first).not.toContain("/contents/beginner-to-uiux-designer-examples");
    expect(
      firstEntries.find(({ url }) =>
        url.endsWith("/guide/beginner-to-uiux-designer-examples"),
      )?.lastModified,
    ).toBe("2026-09-15T00:00:00.000Z");
    expect(
      firstEntries.find(({ url }) => url.endsWith("/roadmap"))?.lastModified,
    ).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("includes allowlisted premium articles (#236 indexablePremium) but not other premium ones", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([
      { _id: "p1", title: "Indexable", slug: { current: "portfolio-02" }, isPremium: true },
      { _id: "p2", title: "Still locked", slug: { current: "some-other-premium" }, isPremium: true },
    ]);
    vi.mocked(getAllGuidesFromSanity).mockResolvedValue([]);
    vi.mocked(getAllLessonSlugs).mockResolvedValue([]);
    vi.mocked(getAllFeedbackSlugs).mockResolvedValue([]);
    vi.mocked(getAllBlogSlugs).mockResolvedValue([]);
    vi.mocked(getAllRoadmapSlugs).mockResolvedValue([]);
    vi.mocked(getAllEvents).mockResolvedValue([]);

    const paths = (await sitemap()).map(({ url }) => new URL(url).pathname);
    expect(paths).toContain("/contents/portfolio-02");
    expect(paths).not.toContain("/contents/some-other-premium");
  });

  it("includes the events list and each event detail page", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([]);
    vi.mocked(getAllGuidesFromSanity).mockResolvedValue([]);
    vi.mocked(getAllLessonSlugs).mockResolvedValue([]);
    vi.mocked(getAllFeedbackSlugs).mockResolvedValue([]);
    vi.mocked(getAllBlogSlugs).mockResolvedValue([]);
    vi.mocked(getAllRoadmapSlugs).mockResolvedValue([]);
    vi.mocked(getAllEvents).mockResolvedValue([
      {
        _id: "event-1",
        title: "Challenge",
        slug: { _type: "slug", current: "uidesign-challenge-2026-10" },
        _updatedAt: "2026-10-05T00:00:00.000Z",
        eventStartAt: "2026-10-21T11:00:00.000Z",
      },
      {
        _id: "event-2",
        title: "Meetup",
        slug: { _type: "slug", current: "meetup-spring-2026" },
        eventMonth: 2,
        eventPeriod: "late",
      },
    ]);

    const entries = await sitemap();
    const paths = entries.map(({ url }) => new URL(url).pathname);

    expect(paths).toContain("/events");
    expect(paths).toContain("/events/uidesign-challenge-2026-10");
    expect(paths).toContain("/events/meetup-spring-2026");
    expect(
      entries.find(({ url }) => url.endsWith("/events/uidesign-challenge-2026-10"))?.lastModified,
    ).toBe("2026-10-05T00:00:00.000Z");
    expect(
      entries.find(({ url }) => url.endsWith("/events/meetup-spring-2026"))?.lastModified,
    ).toBeUndefined();
  });

  it("keeps the sitemap working when events cannot be fetched", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([]);
    vi.mocked(getAllGuidesFromSanity).mockResolvedValue([]);
    vi.mocked(getAllLessonSlugs).mockResolvedValue([]);
    vi.mocked(getAllFeedbackSlugs).mockResolvedValue([]);
    vi.mocked(getAllBlogSlugs).mockResolvedValue([]);
    vi.mocked(getAllRoadmapSlugs).mockResolvedValue([]);
    vi.mocked(getAllEvents).mockRejectedValue(new Error("sanity down"));

    const paths = (await sitemap()).map(({ url }) => new URL(url).pathname);
    expect(paths).toContain("/events");
    expect(paths.some((p) => p.startsWith("/events/"))).toBe(false);
  });

  it("includes public pages that were missing (#236) and excludes dev/noindex pages", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([]);
    vi.mocked(getAllGuidesFromSanity).mockResolvedValue([]);
    vi.mocked(getAllLessonSlugs).mockResolvedValue([]);
    vi.mocked(getAllFeedbackSlugs).mockResolvedValue([]);
    vi.mocked(getAllBlogSlugs).mockResolvedValue([]);
    vi.mocked(getAllRoadmapSlugs).mockResolvedValue([]);
    vi.mocked(getAllEvents).mockResolvedValue([]);

    const paths = (await sitemap()).map(({ url }) => new URL(url).pathname);
    for (const path of [
      "/how-to",
      "/how-to/faq",
      "/stories",
      "/stories/wake",
      "/questions",
      "/training",
      "/training/book-lending-system",
    ]) {
      expect(paths).toContain(path);
    }
    expect(paths).not.toContain("/training/");
    // 会員限定ストーリーは本文が見えないロック画面なので載せない（#236）
    expect(paths).not.toContain("/stories/paid-story");
    // 検索に戻す会員限定ストーリーは載せる（rebono#18）
    expect(paths).toContain("/stories/howtobedesigner-mone");
    expect(paths.some((p) => p.startsWith("/dev") || p === "/top" || p === "/search")).toBe(false);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
