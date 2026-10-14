import { describe, it, expect } from "vitest";
import { buildNotificationMessage } from "@/lib/notifications-display";
import type { NotificationItem } from "@/types/notification";

function makeItem(overrides: Partial<NotificationItem>): NotificationItem {
  return {
    id: "n1",
    actorName: null,
    actorAvatarUrl: null,
    type: "question_comment",
    entityType: "question",
    entityId: "q1",
    linkUrl: "/questions/q1",
    payload: null,
    readAt: null,
    createdAt: "2026-10-14T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildNotificationMessage", () => {
  it("既存 type は actor 名を使う（NULL なら「メンバー」）", () => {
    expect(buildNotificationMessage(makeItem({ actorName: "太郎" }))).toBe(
      "太郎さんがコメントしました",
    );
    expect(buildNotificationMessage(makeItem({}))).toBe(
      "メンバーさんがコメントしました",
    );
  });

  describe("announcement（#245）", () => {
    it("payload.title があればそれを返す", () => {
      const item = makeItem({
        type: "announcement",
        entityType: "announcement",
        linkUrl: "https://bonoco.slack.com/archives/xxx",
        payload: { title: "10/17 作業会のお知らせ" },
      });
      expect(buildNotificationMessage(item)).toBe("10/17 作業会のお知らせ");
    });

    it("payload.title が無い・空・文字列以外なら「運営からのお知らせ」を返す", () => {
      for (const payload of [null, {}, { title: "  " }, { title: 123 }]) {
        const item = makeItem({ type: "announcement", payload });
        expect(buildNotificationMessage(item)).toBe("運営からのお知らせ");
      }
    });

    it("actor が NULL でも「メンバーさん」を含まない", () => {
      const item = makeItem({ type: "announcement" });
      expect(buildNotificationMessage(item)).not.toContain("メンバー");
    });
  });
});
