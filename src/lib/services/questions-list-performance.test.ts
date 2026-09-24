import { beforeEach, describe, expect, it, vi } from "vitest";
import { getQuestionList } from "./questions";
import { createClient, getCachedUser } from "@/lib/supabase/server";

const { fetchQuestions } = vi.hoisted(() => ({
  fetchQuestions: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getCachedUser: vi.fn(),
}));
vi.mock("@/lib/sanity", () => ({
  liveClient: vi.fn(() => ({ fetch: fetchQuestions })),
}));
vi.mock("@/lib/questions/board-user-stats", () => ({
  adjustBoardUserStats: vi.fn(),
}));
vi.mock("@/lib/services/notifications-create", () => ({
  createNotification: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("question list performance", () => {
  it("skips both engagement views for a guest already identified by request auth", async () => {
    fetchQuestions.mockResolvedValue([
      {
        _id: "question-1",
        title: "ゲスト向けの質問",
        slug: { _type: "slug", current: "question-1" },
        publishedAt: "2026-09-24T00:00:00.000Z",
      },
    ]);
    vi.mocked(getCachedUser).mockResolvedValue(null);

    const items = await getQuestionList({ limit: 6 });

    expect(createClient).not.toHaveBeenCalled();
    expect(items).toMatchObject([
      {
        commentCount: 0,
        reactionCounts: { cheer: 0, thanks: 0, insight: 0 },
        lastActivityAt: "2026-09-24T00:00:00.000Z",
        recentCommenters: [],
      },
    ]);
  });

  it("keeps both engagement queries for an authenticated member", async () => {
    fetchQuestions.mockResolvedValue([
      {
        _id: "question-1",
        title: "会員向けの質問",
        slug: { _type: "slug", current: "question-1" },
        publishedAt: "2026-09-24T00:00:00.000Z",
      },
    ]);
    vi.mocked(getCachedUser).mockResolvedValue({ id: "member-1" } as never);

    const summaryIn = vi.fn().mockResolvedValue({ data: [], error: null });
    const reactionIn = vi.fn().mockResolvedValue({ data: [], error: null });
    const from = vi.fn((table: string) => {
      if (table === "question_comment_summaries") {
        return { select: vi.fn(() => ({ in: summaryIn })) };
      }
      if (table === "question_reaction_counts") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ in: reactionIn })),
          })),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    vi.mocked(createClient).mockResolvedValue({ from } as never);

    await getQuestionList({ limit: 6 });

    expect(from).toHaveBeenCalledWith("question_comment_summaries");
    expect(from).toHaveBeenCalledWith("question_reaction_counts");
    expect(summaryIn).toHaveBeenCalledWith("question_id", ["question-1"]);
    expect(reactionIn).toHaveBeenCalledWith("target_id", ["question-1"]);
  });
});
