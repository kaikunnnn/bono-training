// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBookmarkedArticles } from "./bookmarks";
import { getViewHistory } from "./viewHistory";
import { getMypageProgressSnapshot } from "./progress";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getMypageArticlesByIds: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
  getCachedUser: vi.fn(),
}));
vi.mock("@/lib/sanity", () => ({
  getMypageArticlesByIds: mocks.getMypageArticlesByIds,
}));

function queryBuilder<T>(result: { data: T; error: null }) {
  const limit = vi.fn();
  const builder: Record<string, unknown> & PromiseLike<typeof result> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn((count: number) => {
      limit(count);
      return Promise.resolve(result);
    }),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return { builder, limit };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getMypageArticlesByIds.mockResolvedValue([]);
});

describe("mypage preview queries", () => {
  it("limits bookmark rows before requesting article details from Sanity", async () => {
    const { builder, limit } = queryBuilder({
      data: [{ article_id: "article-1" }, { article_id: "article-2" }],
      error: null,
    });
    mocks.createClient.mockResolvedValue({ from: () => builder });

    mocks.getMypageArticlesByIds.mockResolvedValue([
      { _id: "article-2" },
      { _id: "article-1" },
    ]);

    const articles = await getBookmarkedArticles("member", 4);

    expect(limit).toHaveBeenCalledWith(4);
    expect(mocks.getMypageArticlesByIds).toHaveBeenCalledWith([
      "article-1",
      "article-2",
    ]);
    expect(articles.map((article) => article._id)).toEqual([
      "article-1",
      "article-2",
    ]);
  });

  it("does not add a bookmark limit for the full tab", async () => {
    const { builder, limit } = queryBuilder({ data: [], error: null });
    mocks.createClient.mockResolvedValue({ from: () => builder });

    await getBookmarkedArticles("member");

    expect(limit).not.toHaveBeenCalled();
  });

  it("limits history rows before requesting article details from Sanity", async () => {
    const { builder, limit } = queryBuilder({
      data: [{ article_id: "article-1", viewed_at: "2026-09-20T00:00:00Z" }],
      error: null,
    });
    mocks.createClient.mockResolvedValue({ from: () => builder });

    await getViewHistory("member", 4);

    expect(limit).toHaveBeenCalledWith(4);
    expect(mocks.getMypageArticlesByIds).toHaveBeenCalledWith(["article-1"]);
  });

  it("reads article progress and lesson status in one parallel snapshot", async () => {
    const articleQuery = queryBuilder({
      data: [{
        lesson_id: "lesson-1",
        article_id: "article-1",
        updated_at: "2026-09-20T00:00:00Z",
      }],
      error: null,
    });
    const lessonQuery = queryBuilder({
      data: [{ lesson_id: "lesson-2", status: "completed" }],
      error: null,
    });
    const from = vi.fn((table: string) =>
      table === "article_progress" ? articleQuery.builder : lessonQuery.builder
    );
    mocks.createClient.mockResolvedValue({ from });

    await expect(getMypageProgressSnapshot("member")).resolves.toEqual({
      completedArticles: [{
        lessonId: "lesson-1",
        articleId: "article-1",
        updatedAt: "2026-09-20T00:00:00Z",
      }],
      lessonStatuses: { "lesson-2": "completed" },
    });
    expect(from).toHaveBeenCalledWith("article_progress");
    expect(from).toHaveBeenCalledWith("lesson_progress");
  });
});
