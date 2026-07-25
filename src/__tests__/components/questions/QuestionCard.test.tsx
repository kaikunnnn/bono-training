import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { QuestionCard } from "@/components/questions/QuestionCard";
import type { QuestionListItem } from "@/lib/services/questions";
import type { Question } from "@/types/sanity";

const baseQuestion = {
  _id: "q1",
  title: "テスト質問",
  slug: { current: "test-q" },
  publishedAt: "2026-07-01T00:00:00Z",
  questionContent: [],
  author: { displayName: "投稿者", avatarUrl: null },
  category: { _id: "c1", title: "カテゴリ", slug: { current: "cat" } },
} as unknown as Question;

function makeItem(
  commenters: QuestionListItem["recentCommenters"],
  commentCount: number,
): QuestionListItem {
  return {
    question: baseQuestion,
    commentCount,
    reactionCounts: { cheer: 0, thanks: 0, insight: 0 },
    lastActivityAt: "2026-07-01T00:00:00Z",
    recentCommenters: commenters,
  };
}

describe("QuestionCard 直近コメント者アバタースタック", () => {
  it("メンバー(showEngagement) + コメント者ありでアバタースタックが出る", () => {
    const { container } = render(
      <QuestionCard
        item={makeItem(
          [
            { userId: "u1", name: "User1", avatarUrl: "https://ex/1.png" },
            { userId: "u2", name: "User2", avatarUrl: null },
            { userId: "u3", name: "User3", avatarUrl: "https://ex/3.png" },
          ],
          3,
        )}
        showEngagement
      />,
    );
    const stack = container.querySelector(".-space-x-1\\.5");
    expect(stack).not.toBeNull();
    // 3人分のアバター（各 size-5）が描画される
    expect(stack!.querySelectorAll(".size-5").length).toBe(3);
  });

  it("コメント者が空配列なら何も描画しない", () => {
    const { container } = render(
      <QuestionCard item={makeItem([], 0)} showEngagement />,
    );
    expect(container.querySelector(".-space-x-1\\.5")).toBeNull();
  });

  it("非メンバー(showEngagement=false)ではスタックもコメント件数も出ない", () => {
    const { container, queryByText } = render(
      <QuestionCard
        item={makeItem(
          [{ userId: "u1", name: "User1", avatarUrl: null }],
          3,
        )}
        showEngagement={false}
      />,
    );
    expect(container.querySelector(".-space-x-1\\.5")).toBeNull();
    expect(queryByText(/コメント/)).toBeNull();
  });
});
