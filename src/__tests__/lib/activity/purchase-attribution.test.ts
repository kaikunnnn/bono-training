import { afterEach, describe, expect, it } from "vitest";
import {
  ATTRIBUTION_COLUMNS,
  buildAttributionMetadata,
  extractReferrerHost,
  mergeAttributionMetadata,
  normalizeAttributionPath,
  normalizeAttributionTimestamp,
  normalizeReferrerHost,
  normalizeUtmValue,
  normalizeYt,
  parseAttributionMetadata,
  resolveAttributionPatch,
} from "../../../../supabase/functions/_shared/purchase-attribution";
import {
  FIRST_TOUCH_STORAGE_KEY,
  FIRST_TOUCH_TTL_MS,
  buildFirstTouch,
  captureFirstTouch,
  parseStoredFirstTouch,
  readFirstTouch,
  shouldWriteFirstTouch,
} from "@/lib/first-touch";
import {
  LAST_PAGE_PATH_STORAGE_KEY,
  PRICING_SOURCE_PATH_COOKIE,
  buildPricingSourcePathCookie,
  isAttributableSourcePath,
  parsePricingSourcePathCookie,
  readPricingSourcePath,
  recordPagePath,
  rememberPricingSourcePath,
} from "@/lib/pricing-source";

const NOW = new Date("2026-10-07T03:00:00.000Z");

describe("normalizeAttributionPath", () => {
  it("パスだけ残し、クエリ・ハッシュは捨てる", () => {
    expect(normalizeAttributionPath("/lessons/steel-design-sense")).toBe(
      "/lessons/steel-design-sense"
    );
    expect(
      normalizeAttributionPath("/lessons/a?email=foo@example.com&yt=x#top")
    ).toBe("/lessons/a");
  });
  it("不正なものは null", () => {
    expect(normalizeAttributionPath(undefined)).toBeNull();
    expect(normalizeAttributionPath(123)).toBeNull();
    expect(normalizeAttributionPath("lessons/a")).toBeNull();
    expect(normalizeAttributionPath("//evil.example.com/x")).toBeNull();
    expect(normalizeAttributionPath("https://example.com/x")).toBeNull();
    expect(normalizeAttributionPath("/a b")).toBeNull();
    expect(normalizeAttributionPath("/a\nb")).toBeNull();
    expect(normalizeAttributionPath("/レッスン")).toBeNull();
  });
  it("%エンコード済みの非ASCIIは通す", () => {
    expect(normalizeAttributionPath("/lessons/%E3%83%AC")).toBe("/lessons/%E3%83%AC");
  });
  it("200文字で切り詰め、%XX の欠片は落とす", () => {
    const long = "/" + "a".repeat(250);
    expect(normalizeAttributionPath(long)).toHaveLength(200);
    const cutInEscape = "/" + "a".repeat(197) + "%E3%83";
    const out = normalizeAttributionPath(cutInEscape)!;
    expect(out).toBe("/" + "a".repeat(197));
  });
});

describe("normalizeYt / normalizeUtmValue / normalizeReferrerHost / timestamp", () => {
  it("yt は英数と _ - . のみ・64文字まで", () => {
    expect(normalizeYt("aiuistyling")).toBe("aiuistyling");
    expect(normalizeYt(" figma_auto-layout.1 ")).toBe("figma_auto-layout.1");
    expect(normalizeYt("a b")).toBeNull();
    expect(normalizeYt("x@example.com")).toBeNull();
    expect(normalizeYt("a".repeat(65))).toBeNull();
    expect(normalizeYt("")).toBeNull();
  });
  it("utm は日本語可・'@' や記号は不可・100文字に切り詰め", () => {
    expect(normalizeUtmValue("youtube")).toBe("youtube");
    expect(normalizeUtmValue("秋の キャンペーン")).toBe("秋の キャンペーン");
    expect(normalizeUtmValue("foo@example.com")).toBeNull();
    expect(normalizeUtmValue("<script>")).toBeNull();
    expect(normalizeUtmValue("a".repeat(150))).toHaveLength(100);
  });
  it("ホスト名は小文字化・不正は null", () => {
    expect(normalizeReferrerHost("WWW.Google.COM")).toBe("www.google.com");
    expect(normalizeReferrerHost("bad host")).toBeNull();
    expect(normalizeReferrerHost("a".repeat(101))).toBeNull();
  });
  it("referrer はホスト名だけ・自サイトは null", () => {
    expect(
      extractReferrerHost("https://www.youtube.com/watch?v=abc&user=me", "app.bo-no.design")
    ).toBe("www.youtube.com");
    expect(
      extractReferrerHost("https://app.bo-no.design/lessons/a", "app.bo-no.design")
    ).toBeNull();
    expect(extractReferrerHost("", "x.com")).toBeNull();
    expect(extractReferrerHost("not a url", "x.com")).toBeNull();
    expect(extractReferrerHost("android-app://com.google", "x.com")).toBeNull();
  });
  it("日時は2020年〜現在+1日だけ", () => {
    expect(normalizeAttributionTimestamp("2026-10-01T00:00:00Z", NOW)).toBe(
      "2026-10-01T00:00:00.000Z"
    );
    expect(normalizeAttributionTimestamp("2019-01-01T00:00:00Z", NOW)).toBeNull();
    expect(normalizeAttributionTimestamp("2030-01-01T00:00:00Z", NOW)).toBeNull();
    expect(normalizeAttributionTimestamp("garbage", NOW)).toBeNull();
  });
});

describe("buildFirstTouch", () => {
  it("パス・yt・utm・参照元ドメインだけ拾い、他のクエリは捨てる", () => {
    const ft = buildFirstTouch({
      href: "https://app.bo-no.design/lessons/steel-design-sense?yt=aiuistyling&utm_source=youtube&utm_medium=video&email=a@b.c&token=secret",
      referrer: "https://www.youtube.com/watch?v=xyz",
      now: NOW,
    })!;
    expect(ft).toEqual({
      path: "/lessons/steel-design-sense",
      yt: "aiuistyling",
      utm_source: "youtube",
      utm_medium: "video",
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      referrer_host: "www.youtube.com",
      at: NOW.toISOString(),
    });
    expect(JSON.stringify(ft)).not.toContain("secret");
    expect(JSON.stringify(ft)).not.toContain("a@b.c");
  });
  it("自サイトからの referrer は null", () => {
    const ft = buildFirstTouch({
      href: "https://app.bo-no.design/",
      referrer: "https://app.bo-no.design/lessons",
      now: NOW,
    })!;
    expect(ft.referrer_host).toBeNull();
    expect(ft.path).toBe("/");
  });
});

describe("first touch を上書きしない判定", () => {
  const stored = (at: Date) =>
    JSON.stringify({ path: "/lessons/a", yt: "x", at: at.toISOString() });

  it("無い → 書く", () => {
    expect(shouldWriteFirstTouch(null, NOW)).toBe(true);
    expect(shouldWriteFirstTouch("", NOW)).toBe(true);
  });
  it("有効な記録がある → 書かない", () => {
    expect(shouldWriteFirstTouch(stored(new Date(NOW.getTime() - 1000)), NOW)).toBe(false);
  });
  it("期限切れ（90日超）→ 書き直す", () => {
    expect(
      shouldWriteFirstTouch(stored(new Date(NOW.getTime() - FIRST_TOUCH_TTL_MS - 1000)), NOW)
    ).toBe(true);
  });
  it("壊れた値 → 書き直す", () => {
    expect(shouldWriteFirstTouch("{not json", NOW)).toBe(true);
    expect(shouldWriteFirstTouch(JSON.stringify({ path: "/a" }), NOW)).toBe(true);
  });
  it("読み出し時も整形し直す", () => {
    const raw = JSON.stringify({
      path: "/a?x=1",
      yt: "bad value",
      referrer_host: "Example.COM",
      at: NOW.toISOString(),
    });
    const ft = parseStoredFirstTouch(raw, NOW)!;
    expect(ft.path).toBe("/a");
    expect(ft.yt).toBeNull();
    expect(ft.referrer_host).toBe("example.com");
  });
});

describe("captureFirstTouch / readFirstTouch（localStorage）", () => {
  afterEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });
  it("初回だけ記録し、2回目は上書きしない", () => {
    window.history.replaceState(null, "", "/lessons/a?yt=first");
    captureFirstTouch();
    window.history.replaceState(null, "", "/lessons/b?yt=second");
    captureFirstTouch();
    const ft = readFirstTouch()!;
    expect(ft.path).toBe("/lessons/a");
    expect(ft.yt).toBe("first");
    expect(window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY)).toContain("first");
  });
});

describe("ボタンを押したページのパス（cookie）", () => {
  afterEach(() => {
    document.cookie = `${PRICING_SOURCE_PATH_COOKIE}=; Path=/; Max-Age=0`;
    window.sessionStorage.clear();
  });
  it("料金ページ・認証ページは記録しない", () => {
    expect(isAttributableSourcePath("/lessons/a")).toBe(true);
    expect(isAttributableSourcePath("/subscription")).toBe(false);
    expect(isAttributableSourcePath("/subscription/success")).toBe(false);
    expect(isAttributableSourcePath("/dev/pricing-final")).toBe(false);
    expect(isAttributableSourcePath("/login")).toBe(false);
    expect(isAttributableSourcePath("/auth/callback")).toBe(false);
    expect(isAttributableSourcePath("/authors")).toBe(true);
  });
  it("build → parse で往復できる", () => {
    const cookie = buildPricingSourcePathCookie("/lessons/%E3%83%AC", true)!;
    expect(cookie).toContain("Secure");
    const value = cookie.split(";")[0];
    expect(parsePricingSourcePathCookie(`other=1; ${value}`)).toBe("/lessons/%E3%83%AC");
    expect(buildPricingSourcePathCookie("/subscription", false)).toBeNull();
    expect(buildPricingSourcePathCookie("nope", false)).toBeNull();
    expect(parsePricingSourcePathCookie(`${PRICING_SOURCE_PATH_COOKIE}=%2Fsubscription`)).toBeNull();
  });
  it("最後に表示したページを料金ページで cookie に写す", () => {
    recordPagePath("/lessons/steel-design-sense");
    recordPagePath("/subscription"); // 料金ページでは上書きされない
    expect(window.sessionStorage.getItem(LAST_PAGE_PATH_STORAGE_KEY)).toBe(
      "/lessons/steel-design-sense"
    );
    rememberPricingSourcePath();
    expect(readPricingSourcePath()).toBe("/lessons/steel-design-sense");
  });
  it("直前のページが取れなければ cookie を消す（古いパスを残さない）", () => {
    recordPagePath("/lessons/old");
    rememberPricingSourcePath();
    expect(readPricingSourcePath()).toBe("/lessons/old");
    window.sessionStorage.clear();
    rememberPricingSourcePath();
    expect(readPricingSourcePath()).toBeNull();
  });
});

describe("buildAttributionMetadata（Edge Function の再検証）", () => {
  it("値のあるキーだけ・整形済みで返す", () => {
    const md = buildAttributionMetadata(
      {
        sourcePath: "/lessons/a?x=1",
        firstTouch: {
          path: "/",
          yt: "aiuistyling",
          utm_source: "youtube",
          referrer_host: "www.youtube.com",
          at: "2026-10-01T00:00:00.000Z",
          email: "should-not-pass@example.com",
        },
      },
      NOW
    );
    expect(md).toEqual({
      source_path: "/lessons/a",
      first_touch_path: "/",
      first_touch_yt: "aiuistyling",
      first_touch_utm_source: "youtube",
      first_touch_referrer_host: "www.youtube.com",
      first_touch_at: "2026-10-01T00:00:00.000Z",
    });
    for (const [k, v] of Object.entries(md)) {
      expect(k.length).toBeLessThanOrEqual(40);
      expect(v.length).toBeLessThanOrEqual(500);
    }
  });
  it("不正・無しなら空", () => {
    expect(buildAttributionMetadata({}, NOW)).toEqual({});
    expect(
      buildAttributionMetadata({ sourcePath: "x", firstTouch: { at: "bad" } }, NOW)
    ).toEqual({});
  });
  it("metadata のキーは全部 40 文字以内", () => {
    for (const key of ATTRIBUTION_COLUMNS) expect(key.length).toBeLessThanOrEqual(40);
  });
});

describe("mergeAttributionMetadata / parseAttributionMetadata", () => {
  it("キーごとに先勝ちで合成し、関係ないキーは拾わない", () => {
    const merged = mergeAttributionMetadata(
      { source_path: "/a", user_id: "u1" },
      { source_path: "/b", first_touch_yt: "yt1" }
    );
    expect(merged).toEqual({ source_path: "/a", first_touch_yt: "yt1" });
  });
  it("不正値は null に落とす", () => {
    const rec = parseAttributionMetadata({ source_path: "bad", first_touch_yt: "ok" }, NOW);
    expect(rec.source_path).toBeNull();
    expect(rec.first_touch_yt).toBe("ok");
  });
});

describe("resolveAttributionPatch（webhook の保存ルール）", () => {
  const metadata = {
    source_path: "/lessons/a",
    first_touch_path: "/",
    first_touch_yt: "aiuistyling",
    first_touch_at: "2026-10-01T00:00:00.000Z",
  };

  it("プラン変更（置き換え）は触らない", () => {
    expect(
      resolveAttributionPatch({
        existing: null,
        incomingSubscriptionId: "sub_new",
        incomingMetadata: metadata,
        isReplacement: true,
        now: NOW,
      })
    ).toEqual({});
  });
  it("subscription id が無ければ触らない", () => {
    expect(
      resolveAttributionPatch({
        existing: null,
        incomingSubscriptionId: null,
        incomingMetadata: metadata,
        now: NOW,
      })
    ).toEqual({});
  });
  it("新しい契約は全列を今回の値で上書き（無い列は null）", () => {
    const patch = resolveAttributionPatch({
      existing: { stripe_subscription_id: "sub_old", source_path: "/old", first_touch_yt: "old" },
      incomingSubscriptionId: "sub_new",
      incomingMetadata: metadata,
      now: NOW,
    });
    expect(patch.source_path).toBe("/lessons/a");
    expect(patch.first_touch_yt).toBe("aiuistyling");
    expect(patch.first_touch_utm_source).toBeNull();
    expect(Object.keys(patch).sort()).toEqual([...ATTRIBUTION_COLUMNS].sort());
  });
  it("新しい契約で metadata が無ければ全列 null（前の契約の記録を残さない）", () => {
    const patch = resolveAttributionPatch({
      existing: { stripe_subscription_id: "sub_old", source_path: "/old" },
      incomingSubscriptionId: "sub_new",
      incomingMetadata: {},
      now: NOW,
    });
    expect(patch.source_path).toBeNull();
  });
  it("同じ契約は既存値を保持し、空の列だけ埋める", () => {
    const patch = resolveAttributionPatch({
      existing: { stripe_subscription_id: "sub_1", source_path: "/kept", first_touch_yt: null },
      incomingSubscriptionId: "sub_1",
      incomingMetadata: metadata,
      now: NOW,
    });
    expect(patch).toEqual({
      first_touch_path: "/",
      first_touch_yt: "aiuistyling",
      first_touch_at: "2026-10-01T00:00:00.000Z",
    });
  });
  it("同じ契約で今回の値が無ければ何も触らない", () => {
    expect(
      resolveAttributionPatch({
        existing: { stripe_subscription_id: "sub_1", source_path: "/kept" },
        incomingSubscriptionId: "sub_1",
        incomingMetadata: {},
        now: NOW,
      })
    ).toEqual({});
  });
});
