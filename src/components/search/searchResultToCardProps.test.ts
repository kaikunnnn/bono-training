import { describe, expect, it } from "vitest";
import type { ArticleSearchResult } from "@/types/search";
import { resolveSearchResultHref } from "./searchResultToCardProps";

const article = (overrides: Partial<ArticleSearchResult> = {}): ArticleSearchResult => ({
  id: "a1",
  type: "article",
  title: "記事",
  description: "",
  slug: "ux-beginner07",
  ...overrides,
});

describe("resolveSearchResultHref", () => {
  it("記事は親レッスンがあっても /contents/:slug へリンクする", () => {
    expect(resolveSearchResultHref(article({ parentLessonSlug: "ux-biginner" }))).toBe(
      "/contents/ux-beginner07"
    );
  });

  it("親レッスンが無い記事も /contents/:slug へリンクする", () => {
    expect(resolveSearchResultHref(article())).toBe("/contents/ux-beginner07");
  });
});
