// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAllArticles,
  getAllBlogSlugs,
  getAllFeedbackSlugs,
  getAllGuideSlugsFromSanity,
  getAllLessonSlugs,
  getAllRoadmapSlugs,
} from "@/lib/sanity";
import sitemap from "./sitemap";

vi.mock("@/lib/sanity", () => ({
  getAllArticles: vi.fn(),
  getAllBlogSlugs: vi.fn(),
  getAllFeedbackSlugs: vi.fn(),
  getAllGuideSlugsFromSanity: vi.fn(),
  getAllLessonSlugs: vi.fn(),
  getAllRoadmapSlugs: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

describe("sitemap", () => {
  it("keeps free article URLs stable without reading its own published sitemap", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([
      { _id: "free", title: "Free", slug: { current: "free-article" } },
      { _id: "paid", title: "Paid", slug: { current: "paid-article" }, isPremium: true },
      {
        _id: "duplicate",
        title: "Guide copy",
        slug: { current: "beginner-to-uiux-designer-examples" },
      },
    ]);
    vi.mocked(getAllGuideSlugsFromSanity).mockResolvedValue([
      "beginner-to-uiux-designer-examples",
    ]);
    vi.mocked(getAllLessonSlugs).mockResolvedValue([]);
    vi.mocked(getAllFeedbackSlugs).mockResolvedValue([]);
    vi.mocked(getAllBlogSlugs).mockResolvedValue([]);
    vi.mocked(getAllRoadmapSlugs).mockResolvedValue([]);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const first = (await sitemap()).map(({ url }) => new URL(url).pathname);
    const second = (await sitemap()).map(({ url }) => new URL(url).pathname);

    expect(first).toEqual(second);
    expect(first).toContain("/contents/free-article");
    expect(first).toContain("/guide/beginner-to-uiux-designer-examples");
    expect(first).not.toContain("/contents/paid-article");
    expect(first).not.toContain("/contents/beginner-to-uiux-designer-examples");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
