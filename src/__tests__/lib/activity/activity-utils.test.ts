import { describe, expect, it } from "vitest";
import {
  ACTIVITY_EVENT_TYPES,
  PRICING_CTA_SOURCE_GROUPS,
  buildActivityRow,
  isActivityEventType,
  parsePricingFrom,
  toJstDateString,
  withPricingFrom,
  type PricingCtaSourceGroup,
} from "@/lib/activity-utils";
import { withSignUpMarker } from "@/lib/auth-markers";

describe("activity event types (DB CHECK と一致)", () => {
  it("固定8種のみ", () => {
    expect(ACTIVITY_EVENT_TYPES).toEqual([
      "site_visit",
      "article_view",
      "article_complete",
      "lesson_view",
      "questions_view",
      "community_join_click",
      "success_next_click",
      "pricing_cta_click",
    ]);
    expect(isActivityEventType("site_visit")).toBe(true);
    expect(isActivityEventType("page_view")).toBe(false);
    expect(isActivityEventType(undefined)).toBe(false);
  });
});

describe("buildActivityRow", () => {
  it("正しい入力を insert 行にする（user_id は付けない）", () => {
    expect(
      buildActivityRow({
        eventType: "article_view",
        articleId: " a1 ",
        lessonId: "l1",
        path: "/contents/x",
        meta: { a: 1 },
      })
    ).toEqual({
      event_type: "article_view",
      article_id: "a1",
      lesson_id: "l1",
      path: "/contents/x",
      meta: { a: 1 },
    });
  });

  it("省略項目は null / meta は {}", () => {
    expect(buildActivityRow({ eventType: "site_visit" })).toEqual({
      event_type: "site_visit",
      article_id: null,
      lesson_id: null,
      path: null,
      meta: {},
    });
  });

  it("不正な event_type・入力は null", () => {
    expect(buildActivityRow({ eventType: "hack" })).toBeNull();
    expect(buildActivityRow(null)).toBeNull();
    expect(buildActivityRow("site_visit")).toBeNull();
  });

  it("meta は plain object のみ・大きすぎるものは拒否", () => {
    expect(buildActivityRow({ eventType: "site_visit", meta: [1] })).toBeNull();
    expect(buildActivityRow({ eventType: "site_visit", meta: "x" })).toBeNull();
    expect(
      buildActivityRow({ eventType: "site_visit", meta: { big: "x".repeat(3000) } })
    ).toBeNull();
  });

  it("文字列以外の id は null・長すぎる値は切り詰め", () => {
    const row = buildActivityRow({
      eventType: "article_view",
      articleId: 123,
      path: "/" + "p".repeat(1000),
    });
    expect(row?.article_id).toBeNull();
    expect(row?.path?.length).toBe(500);
  });
});

describe("withPricingFrom / parsePricingFrom", () => {
  it("クエリ無しは ?from= を付ける", () => {
    expect(withPricingFrom("/subscription", "lesson_lock")).toBe(
      "/subscription?from=lesson_lock"
    );
  });

  it("既存クエリには & で足し、既存 from は上書き、hash は保持", () => {
    expect(withPricingFrom("/subscription?x=1&from=old#plans", "nav")).toBe(
      "/subscription?x=1&from=nav#plans"
    );
  });

  it("不正な group は other に丸める", () => {
    expect(
      withPricingFrom("/subscription", "evil" as unknown as PricingCtaSourceGroup)
    ).toBe("/subscription?from=other");
  });

  it("9グループすべて往復できる", () => {
    for (const group of PRICING_CTA_SOURCE_GROUPS) {
      const href = withPricingFrom("/subscription", group);
      const from = new URLSearchParams(href.split("?")[1]).get("from");
      expect(parsePricingFrom(from)).toBe(group);
    }
    expect(PRICING_CTA_SOURCE_GROUPS).toHaveLength(9);
  });

  it("parsePricingFrom は不正・欠落で undefined", () => {
    expect(parsePricingFrom(null)).toBeUndefined();
    expect(parsePricingFrom("")).toBeUndefined();
    expect(parsePricingFrom("<script>")).toBeUndefined();
  });
});

describe("toJstDateString", () => {
  it("UTC 15:00 以降は JST で翌日", () => {
    expect(toJstDateString(new Date("2026-09-30T14:59:59Z"))).toBe("2026-09-30");
    expect(toJstDateString(new Date("2026-09-30T15:00:00Z"))).toBe("2026-10-01");
  });
});

describe("withSignUpMarker", () => {
  it("クエリの有無・hash を考慮して signup=1 を足す", () => {
    expect(withSignUpMarker("/")).toBe("/?signup=1");
    expect(withSignUpMarker("/subscription?intent_plan=standard")).toBe(
      "/subscription?intent_plan=standard&signup=1"
    );
    expect(withSignUpMarker("/mypage#top")).toBe("/mypage?signup=1#top");
  });
});
