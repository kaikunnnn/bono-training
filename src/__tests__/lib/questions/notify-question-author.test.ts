import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * notifyQuestionAuthorOfComment 経路（addComment 内）の回帰テスト。
 * author.userId が欠けた質問へのコメントで、クラッシュせず通知を skip し、
 * コメント投稿自体は成功する（fire-and-forget）ことを検証する。
 */

// createNotification をスパイ化（実DB・通知作成には触れない）
const { createNotificationSpy } = vi.hoisted(() => ({
  createNotificationSpy: vi.fn(async () => {}),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/services/notifications-create", () => ({
  createNotification: createNotificationSpy,
}));

// Sanity: author.userId を持たない質問を返す（authorless）
vi.mock("@/lib/sanity", () => ({
  client: () => ({
    fetch: async () => ({ title: "質問タイトル", author: {} }),
  }),
}));

vi.mock("@/lib/questions/board-user-stats", () => ({
  adjustBoardUserStats: vi.fn(async () => {}),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const COMMENT_ROW = {
  id: "comment-1",
  question_id: "question-1",
  user_id: "user-1",
  author_name: "Tester",
  author_avatar_url: null,
  content: "こんにちは",
  image_url: null,
  created_at: "2026-08-28T00:00:00.000Z",
  updated_at: "2026-08-28T00:00:00.000Z",
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-1", email: "tester@example.com", user_metadata: {} } },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({ data: COMMENT_ROW, error: null })),
        })),
      })),
    })),
  })),
  getCachedUser: vi.fn(),
}));

import { addComment } from "@/lib/services/questions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addComment → notifyQuestionAuthorOfComment（authorless）", () => {
  it("author.userId 欠落でもクラッシュせずコメント投稿は成功し、通知は skip される", async () => {
    const result = await addComment({
      questionId: "question-1",
      questionSlug: "my-question",
      content: "こんにちは",
    });

    expect(result.ok).toBe(true);
    // 宛先が解決できないため通知は作成されない
    expect(createNotificationSpy).not.toHaveBeenCalled();
  });
});
