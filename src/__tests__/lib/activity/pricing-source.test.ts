import { afterEach, describe, expect, it, vi } from "vitest";
import { PRICING_CTA_SOURCE_GROUPS } from "@/lib/activity-utils";
import {
  PRICING_SOURCE_COOKIE,
  PRICING_SOURCE_MAX_AGE_SECONDS,
  buildPricingSourceCookie,
  parsePricingSourceCookie,
  readPricingSource,
  rememberPricingSource,
} from "@/lib/pricing-source";
import {
  PRICING_SOURCE_GROUPS,
  normalizePricingSourceGroup,
  resolveSourceGroupPatch,
} from "../../../../supabase/functions/_shared/pricing-source";

function clearCookie() {
  document.cookie = `${PRICING_SOURCE_COOKIE}=; Path=/; Max-Age=0`;
}

describe("9グループの一致（アプリ ↔ Edge Function）", () => {
  it("activity-utils と _shared/pricing-source の一覧が同じ", () => {
    expect([...PRICING_SOURCE_GROUPS]).toEqual([...PRICING_CTA_SOURCE_GROUPS]);
  });
});

describe("buildPricingSourceCookie", () => {
  it("有効な group で cookie 文字列を作る", () => {
    expect(buildPricingSourceCookie("lesson_lock", false)).toBe(
      `${PRICING_SOURCE_COOKIE}=lesson_lock; Path=/; Max-Age=${PRICING_SOURCE_MAX_AGE_SECONDS}; SameSite=Lax`
    );
  });

  it("https では Secure を付ける", () => {
    expect(buildPricingSourceCookie("top", true)).toMatch(/; Secure$/);
  });

  it.each([undefined, null, "", "direct", "LESSON_LOCK", "lesson_lock;x=1", 1])(
    "不正な値 %p は null",
    (value) => {
      expect(buildPricingSourceCookie(value, false)).toBeNull();
    }
  );
});

describe("parsePricingSourceCookie", () => {
  it("他の cookie と混ざっていても読める", () => {
    expect(
      parsePricingSourceCookie(`a=1; ${PRICING_SOURCE_COOKIE}=roadmap; b=2`)
    ).toBe("roadmap");
  });

  it("無し・空は null", () => {
    expect(parsePricingSourceCookie("")).toBeNull();
    expect(parsePricingSourceCookie(undefined)).toBeNull();
    expect(parsePricingSourceCookie("a=1")).toBeNull();
  });

  it("改ざんされた値は null", () => {
    expect(parsePricingSourceCookie(`${PRICING_SOURCE_COOKIE}=evil`)).toBeNull();
  });
});

describe("rememberPricingSource / readPricingSource（last-click）", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearCookie();
  });

  it("有効な from を保存して読める", () => {
    rememberPricingSource("lesson_lock");
    expect(readPricingSource()).toBe("lesson_lock");
  });

  it("新しい有効な from で上書きする（最後に押したボタン）", () => {
    rememberPricingSource("lesson_lock");
    rememberPricingSource("nav");
    expect(readPricingSource()).toBe("nav");
  });

  it("from 無し・不正な値では既存値を消さない（ログイン往復で from が落ちても残る）", () => {
    rememberPricingSource("feedback");
    rememberPricingSource(undefined);
    rememberPricingSource(null);
    rememberPricingSource("direct");
    rememberPricingSource("bogus");
    expect(readPricingSource()).toBe("feedback");
  });

  it("何も保存していなければ null（=直接）", () => {
    expect(readPricingSource()).toBeNull();
  });

  it("cookie アクセスが例外を投げても落ちない", () => {
    vi.spyOn(document, "cookie", "get").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(document, "cookie", "set").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => rememberPricingSource("top")).not.toThrow();
    expect(readPricingSource()).toBeNull();
  });
});

describe("normalizePricingSourceGroup（Edge Function 側の再検証）", () => {
  it.each(PRICING_CTA_SOURCE_GROUPS)("%s は通す", (group) => {
    expect(normalizePricingSourceGroup(group)).toBe(group);
  });

  it.each([undefined, null, "", "direct", " top", {}, 3])(
    "%p は null",
    (value) => {
      expect(normalizePricingSourceGroup(value)).toBeNull();
    }
  );
});

describe("resolveSourceGroupPatch（webhook の保存ルール）", () => {
  const row = (subId: string | null, group: string | null) => ({
    stripe_subscription_id: subId,
    source_group: group,
  });

  it("行が無い（初回の契約）なら今回の値を書く", () => {
    expect(
      resolveSourceGroupPatch({
        existing: null,
        incomingSubscriptionId: "sub_new",
        incomingSourceGroup: "lesson_lock",
      })
    ).toEqual({ source_group: "lesson_lock" });
  });

  it("新しい subscription（解約後の再入会）は今回の値で上書きする", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_old", "lesson_lock"),
        incomingSubscriptionId: "sub_new",
        incomingSourceGroup: "nav",
      })
    ).toEqual({ source_group: "nav" });
  });

  it("新しい subscription で from が無い・不正なら null に上書きする（直接/不明）", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_old", "lesson_lock"),
        incomingSubscriptionId: "sub_new",
        incomingSourceGroup: undefined,
      })
    ).toEqual({ source_group: null });
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_old", "lesson_lock"),
        incomingSubscriptionId: "sub_new",
        incomingSourceGroup: "direct",
      })
    ).toEqual({ source_group: null });
  });

  it("既存行の subscription id が null なら新しい契約として扱う", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row(null, "top"),
        incomingSubscriptionId: "sub_new",
        incomingSourceGroup: "event",
      })
    ).toEqual({ source_group: "event" });
  });

  it("同じ subscription（created と checkout.completed の重複・更新）は既存値を保持する", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_1", "lesson_lock"),
        incomingSubscriptionId: "sub_1",
        incomingSourceGroup: "nav",
      })
    ).toEqual({});
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_1", "lesson_lock"),
        incomingSubscriptionId: "sub_1",
        incomingSourceGroup: undefined,
      })
    ).toEqual({});
  });

  it("同じ subscription で既存が null・今回が有効なら書く（イベント順序の入れ替わり）", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_1", null),
        incomingSubscriptionId: "sub_1",
        incomingSourceGroup: "roadmap",
      })
    ).toEqual({ source_group: "roadmap" });
  });

  it("同じ subscription で既存が null・今回も無しなら触らない", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_1", null),
        incomingSubscriptionId: "sub_1",
        incomingSourceGroup: undefined,
      })
    ).toEqual({});
  });

  it("プラン変更（置き換え checkout）は新しい subscription id でも既存値を保持する", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_old", "lesson_lock"),
        incomingSubscriptionId: "sub_new",
        incomingSourceGroup: undefined,
        isReplacement: true,
      })
    ).toEqual({});
  });

  it("今回の subscription id が無ければ触らない（判定不能）", () => {
    expect(
      resolveSourceGroupPatch({
        existing: row("sub_1", "top"),
        incomingSubscriptionId: undefined,
        incomingSourceGroup: "nav",
      })
    ).toEqual({});
  });
});
